function parseNumber(value) {
  const num = parseInt(value.toString());
  if (isNaN(num)) return undefined;
  return num;
}

// registerLayout() 定义自定义布局的名称，甚至可以是汉字，比如「瀑布流」
registerLayout('masonry', class {
  static get inputProperties() {
    return [ '--gap', '--columns', '--column-auto-width' ];
  }

  // [css-layout-api] Convert to promise based API
  // https://chromium.googlesource.com/chromium/src.git/+/9c224451fb63df743fbd510052458e088a438517
  async intrinsicSizes() {
    /* TODO 浏览器暂未实现*/
  }

  async layout(children, edges, constraints, styleMap) {
    // edges 已经实现，现在可以灵活的获取边距
    // https://bugs.chromium.org/p/chromium/issues/detail?id=726125#c40

    const borderWidthInline = edges.inline; // 父元素 border + padding + scrollbar 宽度
    const inlineSize = constraints.fixedInlineSize - borderWidthInline; // 实际渲染区域的总宽度

    let gap = parseNumber(styleMap.get('--gap'));
    if (gap < 0) gap = 0
    let columnValue = styleMap.get('--columns');

    const columnAutoWidth = parseNumber(styleMap.get('--column-auto-width'));

    let columns = parseNumber(columnValue);

    // '--columns' 支持 auto 取值，根据 '--column-auto-width' 的值来自动计算
    // --columns = 0 时，使用 --column-auto-width 的值自动计算
    if (columnValue === 'auto' || columns === 0 || !columns) {
      columns = Math.ceil(inlineSize / columnAutoWidth);
    } else if (columns <= 0) {
      columns = 1
    }

    // 先确定每列子元素的宽度
    const childInlineSize = (inlineSize - ((columns - 1) * gap)) / columns; // 计算子元素宽度
    const childFragments = await Promise.all(
      children.map(child => {
        return child.layoutNextFragment({fixedInlineSize: childInlineSize});
      })
    );

    let autoBlockSize = 0;
    const columnOffsets = Array(columns).fill(0);

    for (let childFragment of childFragments) {
      // Select the column with the least amount of stuff in it.
      const min = columnOffsets.reduce((acc, val, idx) => {
        if (!acc || val < acc.val) {
          return {idx, val};
        }

        return acc;
      }, {val: +Infinity, idx: -1});

      // 水平方向
      childFragment.inlineOffset = (childInlineSize + gap) * min.idx + edges.inlineStart;

      // 垂直方向
      if (min.val === 0) {
        // 顶部 border 偏移
        childFragment.blockOffset = min.val + edges.blockStart;
      } else {
        childFragment.blockOffset = min.val + gap;
      }

      // 计算外层容器高度
      columnOffsets[min.idx] = childFragment.blockOffset + childFragment.blockSize;
      autoBlockSize = Math.max(autoBlockSize, columnOffsets[min.idx] + edges.blockEnd);
    }

    return {autoBlockSize, childFragments};
  }
});
