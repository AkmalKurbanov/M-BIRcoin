document.addEventListener("DOMContentLoaded", () => {
  const containerCheck = document.getElementById('tree-container');
  if (!containerCheck) {
    console.warn("tree.js: #tree-container отсутствует — дерево не запускается");
    return;
  }

  d3.json("js/tree.json").then(data => {
    const dx = 55;
    const dy = 200;
    const root = d3.hierarchy(data);
    const tree = d3.tree().nodeSize([dx, dy]);
    const originalRoot = root.copy();

    // свернуть всё кроме корня - корень НЕ сворачиваем
    function collapse(d) {
      // Пропускаем корневой элемент (depth === 0)
      if (d.depth === 0) {
        if (d.children) {
          d.children.forEach(collapse);
        }
        return;
      }

      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    // Применяем свертывание
    collapse(root);

    const svg = d3.select("#tree-container")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .style("user-select", "none")
      .style("cursor", "grab");

    const background = svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "transparent")
      .style("pointer-events", "all");

    const g = svg.append("g");
    const linkGroup = g.append("g").attr("stroke", "#FFBD59").attr("fill", "none").attr("stroke-width", 2);
    const nodeGroup = g.append("g");

    const nodeHalfWidth = 80;
    const customLink = d => {
      const exitOffset = 40;
      const sourceX = d.source.x;
      const sourceY = d.source.y + nodeHalfWidth - exitOffset;
      const targetX = d.target.x;
      const targetY = d.target.y - nodeHalfWidth;
      const midY = (sourceY + targetY) / 2;
      return `M${sourceY},${sourceX} C${midY},${sourceX} ${midY},${targetX} ${targetY},${targetX}`;
    };

    const getBgByDepth = depth => {
      if (depth === 0) return "url('./images/level/level1-320.png')";
      if (depth === 1) return "url('./images/level/level2-320.png')";
      if (depth === 2) return "url('./images/level/level3-320.png')";
      if (depth === 3) return "url('./images/level/level4-320.png')";
      if (depth === 4) return "url('./images/level/level5-320.png')";
      return "url('./images/level/level6-320.png')";
    };

    const getCountBgByDepth = depth => {
      if (depth === 0) return "#FDB903";
      if (depth === 1) return "#FDB903";
      if (depth === 2) return "#E2E2E2";
      if (depth === 3) return "#DADADA";
      if (depth === 4) return "#38B6FF";
      if (depth === 5) return "#00BF63";
      return "#00BF63";
    };

    function update(source) {
      tree(root);
      const links = root.links();
      const nodes = root.descendants();

      const link = linkGroup.selectAll("path")
        .data(links, d => d.target.data.id);

      link.join(
        enter => enter.append("path")
          .attr("d", customLink)
          .attr("stroke-opacity", 0)
          .transition().duration(300)
          .attr("stroke-opacity", 1),
        update => update.transition().duration(300).attr("d", customLink),
        exit => exit.transition().duration(300)
          .attr("stroke-opacity", 0)
          .attr("d", d => {
            const o = { x: source.x, y: source.y };
            return customLink({ source: o, target: o });
          })
          .remove()
      );

      const node = nodeGroup.selectAll("g")
        .data(nodes, d => d.data.id);

      const nodeEnter = node.enter()
        .append("g")
        .attr("transform", d => `translate(${source.y0 || 0},${source.x0 || 0})`)
        .on("click", (event, d) => {
          // Корневой элемент нельзя свернуть/развернуть
          if (d.depth === 0) return;

          d.children = d.children ? null : d._children;
          update(d);
        });

      nodeEnter.append("foreignObject")
        .attr("x", -80)
        .attr("y", -23)
        .attr("width", 160)
        .attr("height", 46)
        .append("xhtml:div")
        .attr("class", "tree-item")
        .attr("data-id", d => d.data.id)
        .style("background-image", d => getBgByDepth(d.depth))
        .style("background-size", "cover")
        .style("background-position", "center")
        .html(d => `
        <div class="tree-item__rang">${d.data.rang}</div>
        <div class="tree-item__name">${d.data.name}</div>
        <div class="tree-item__count" style="background:${getCountBgByDepth(d.depth)}">${d.data.count}</div>
      `);

      nodeEnter.transition().duration(300)
        .attr("transform", d => `translate(${d.y},${d.x})`);
      node.transition().duration(300)
        .attr("transform", d => `translate(${d.y},${d.x})`);
      node.exit().transition().duration(300)
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .remove();

      root.each(d => { d.x0 = d.x; d.y0 = d.y; });
    }

    root.x0 = 0;
    root.y0 = 0;
    update(root);

    let isDragging = false;

    // ВЫЧИСЛЯЕМ начальную позицию автоматически
    const container = document.getElementById('tree-container').getBoundingClientRect();
    const treeBounds = g.node().getBBox();

    const initialX = 80; // небольшое смещение вправо от левого края
    const initialY = container.height / 2 - treeBounds.y - treeBounds.height / 2;


    const initialTransform = d3.zoomIdentity.translate(initialX, initialY).scale(1);

    // УБИРАЕМ ограничения или делаем их разумными
    function constrainTransform(transform) {
      const container = document.getElementById('tree-container').getBoundingClientRect();
      const treeBounds = g.node().getBBox();

      // Более мягкие ограничения
      const padding = 200;
      const minX = -treeBounds.width - padding;
      const maxX = container.width + padding;
      const minY = -treeBounds.height - padding;
      const maxY = container.height + padding;
      const minScale = 0.4;
      const maxScale = 6;

      const constrainedX = Math.max(minX, Math.min(maxX, transform.x));
      const constrainedY = Math.max(minY, Math.min(maxY, transform.y));
      const constrainedK = Math.max(minScale, Math.min(maxScale, transform.k));

      return d3.zoomIdentity
        .translate(constrainedX, constrainedY)
        .scale(constrainedK);
    }

    const zoom = d3.zoom()
      .scaleExtent([0.4, 6])
      .on("start", function (event) {
        isDragging = true;
        svg.style("cursor", "grabbing");
      })
      .on("zoom", function (event) {
        // УБИРАЕМ ограничения при обычном зуме/драге
        g.attr("transform", event.transform);
      })
      .on("end", function (event) {
        isDragging = false;
        setTimeout(() => {
          if (!isDragging) {
            svg.style("cursor", "grab");
          }
        }, 50);
      });

    // ПРИМЕНЯЕМ зум к САМОМУ SVG, а не к background
    svg.call(zoom);
    svg.call(zoom.transform, initialTransform);
    svg.on("dblclick.zoom", null);

    // Обработчики для background
    background
      .on("mousedown", () => {
        svg.style("cursor", "grabbing");
      })
      .on("mouseup", () => {
        svg.style("cursor", "grab");
      })
      .on("mouseleave", () => {
        if (!isDragging) {
          svg.style("cursor", "grab");
        }
      });

    // ... остальной код (поиск) остается без изменений ...
    const searchInput = document.querySelector('#search');
    let searchTimeout = null;

    function normalize(str) {
      return str
        .toLowerCase()
        .replace(/[a-z]/g, ch => {
          const map = { a: 'а', e: 'е', o: 'о', c: 'с', x: 'х', p: 'р', y: 'у', k: 'к', m: 'м', t: 'т', h: 'н', b: 'в' };
          return map[ch] || ch;
        })
        .replace(/\u00A0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Функция для вычисления расстояния Левенштейна (похожести строк)
    function levenshteinDistance(a, b) {
      const matrix = [];
      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    }

    // Проверяет, похожи ли слова (допускает 1-2 ошибки в зависимости от длины слова)
    function isSimilar(word1, word2) {
      if (word1 === word2) return true;

      const minLength = Math.min(word1.length, word2.length);
      const maxLength = Math.max(word1.length, word2.length);

      // Для коротких слов (2-4 символа) допускаем 1 ошибку
      if (minLength <= 4) {
        return levenshteinDistance(word1, word2) <= 1;
      }
      // Для средних слов (5-7 символов) допускаем 2 ошибки
      else if (minLength <= 7) {
        return levenshteinDistance(word1, word2) <= 2;
      }
      // Для длинных слов (8+ символов) допускаем 3 ошибки
      else {
        return levenshteinDistance(word1, word2) <= 3;
      }
    }

    // Улучшенная функция поиска с допущением опечаток
    function matchesSearch(query, name) {
      const normalizedQuery = normalize(query);
      const normalizedName = normalize(name);

      // Если запрос пустой или имя пустое
      if (!normalizedQuery || !normalizedName) return false;

      // Если запрос состоит из одного слова
      if (!normalizedQuery.includes(' ')) {
        // Сначала проверяем точное совпадение
        if (normalizedName.includes(normalizedQuery)) return true;

        // Затем проверяем похожие слова в имени
        const nameWords = normalizedName.split(' ').filter(word => word.length > 0);
        return nameWords.some(nameWord => isSimilar(normalizedQuery, nameWord));
      }

      // Если запрос состоит из нескольких слов
      const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);
      const nameWords = normalizedName.split(' ').filter(word => word.length > 0);

      // Проверяем, что для каждого слова запроса есть похожее слово в имени
      return queryWords.every(queryWord =>
        nameWords.some(nameWord => isSimilar(queryWord, nameWord))
      );
    }

    function findNodeInCurrentTree(nodeId, currentNode = root) {
      if (currentNode.data.id === nodeId) return currentNode;
      if (currentNode.children) {
        for (let child of currentNode.children) {
          const found = findNodeInCurrentTree(nodeId, child);
          if (found) return found;
        }
      }
      if (currentNode._children) {
        for (let child of currentNode._children) {
          const found = findNodeInCurrentTree(nodeId, child);
          if (found) return found;
        }
      }
      return null;
    }

    function expandToNode(targetNode) {
      const path = [];
      let current = targetNode;
      while (current && current.parent) {
        path.unshift(current.parent);
        current = current.parent;
      }
      path.forEach(parentNode => {
        const currentNodeInTree = findNodeInCurrentTree(parentNode.data.id);
        if (currentNodeInTree && !currentNodeInTree.children && currentNodeInTree._children) {
          currentNodeInTree.children = currentNodeInTree._children;
          currentNodeInTree._children = null;
        }
      });
    }

    function focusOnNode(nodeData) {
      const nodeInTree = findNodeInCurrentTree(nodeData.data.id);
      if (!nodeInTree) return;
      const currentTransform = d3.zoomTransform(svg.node());
      const nodeX = nodeInTree.y;
      const nodeY = nodeInTree.x;
      const container = svg.node().getBoundingClientRect();
      const centerX = container.width / 2;
      const centerY = container.height / 2;
      const targetScale = 1.8;
      const targetX = centerX - nodeX * targetScale;
      const targetY = centerY - nodeY * targetScale;

      const targetTransform = d3.zoomIdentity
        .translate(targetX, targetY)
        .scale(targetScale);

      svg.transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, targetTransform);
    }

    function resetZoom() {
      svg.transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, initialTransform);
    }

    function performSearch(query) {
      const q = query.trim();
      d3.selectAll('.tree-item').style('outline', 'none');
      if (!q || q.length < 2) return;

      const matches = originalRoot.descendants().filter(d =>
        matchesSearch(q, d.data.name || '')
      );

      if (matches.length === 0) return;

      matches.forEach(match => {
        expandToNode(match);
      });

      update(root);

      setTimeout(() => {
        matches.forEach(d => {
          const el = document.querySelector(`[data-id="${d.data.id}"]`);
          if (el) {
            el.style.outline = '3px solid #FFBD59';
            el.style.outlineOffset = '2px';
          }
        });

        if (matches.length > 0) {
          const firstMatch = matches[0];
          const firstEl = document.querySelector(`[data-id="${firstMatch.data.id}"]`);
          if (firstEl) {
            firstEl.querySelector('.tree-item__name').style.color = 'red';
          }
          setTimeout(() => {
            focusOnNode(firstMatch);
          }, 500);
        }
      }, 400);
    }

    searchInput.addEventListener('input', e => {
      const query = e.target.value.trim();
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (!query) {
        d3.selectAll('.tree-item').style('outline', 'none');
        d3.selectAll('.tree-item__name').style('color', '');
        resetZoom();
        return;
      }
      searchTimeout = setTimeout(() => {
        performSearch(query);
      }, 800);
    });

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.target.value = '';
        d3.selectAll('.tree-item').style('outline', 'none');
        d3.selectAll('.tree-item__name').style('color', '');
        resetZoom();
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
      }
    });
  });

});