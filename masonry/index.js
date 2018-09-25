function parseNumber(value) {
  const num = parseInt(value.toString());
  if (isNaN(num)) return undefined;
  return num;
}

// registerLayout() 定义自定义布局的名称，甚至可以是汉字，比如「瀑布流」
registerLayout('masonry', class {
  static get inputProperties() {
    return [ '--gap', '--columns', '--column-auto-width', '--border', ];
  }

  *intrinsicSizes() {
    /* TODO 浏览器暂未实现*/
  }

  *layout(children, edges, constraints, styleMap) {
    // Hack：由于 edges 暂未实现，目前只能通过自定义属性获取 border 宽度
    // https://chromium.googlesource.com/chromium/src.git/+/585c7af06665d7a58616a6c9dce46dc095f95d81/third_party/WebKit/Source/core/layout/custom/CSSLayoutDefinition.cpp#102
    const borderWidth = parseNumber(styleMap.get('--border')); // 边框宽度
    const inlineSize = constraints.fixedInlineSize - borderWidth * 2; //父元素宽度，6 去掉边框宽度
    let gap = parseNumber(styleMap.get('--gap'));
    if (gap < 0) { gap = 0}
    let columnValue = styleMap.get('--columns');

    const columnAutoWidth = parseNumber(styleMap.get('--column-auto-width'));

    let columns = parseNumber(columnValue);
    //  '--columns' 支持 auto 取值，根据 '--column-auto-width' 的值来自动计算
    if (columnValue === 'auto' || !columns) {
      columns = Math.ceil(inlineSize / columnAutoWidth);
    }

    // 先确定每列子元素的宽度
    const childInlineSize = (inlineSize - ((columns - 1) * gap)) / columns; // 计算子元素宽度
    const childFragments = yield children.map((child) => {
      return child.layoutNextFragment({fixedInlineSize: childInlineSize});
    });

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
      childFragment.inlineOffset = (childInlineSize + gap) * min.idx + borderWidth;

      // 垂直方向
      if (min.val === 0) {
        // 顶部 border 偏移
        childFragment.blockOffset = min.val + borderWidth;
      } else {
        childFragment.blockOffset = min.val + gap;
      }

      // 计算外层容器高度
      columnOffsets[min.idx] = childFragment.blockOffset + childFragment.blockSize;
      autoBlockSize = Math.max(autoBlockSize, columnOffsets[min.idx] + borderWidth);
    }

    return {autoBlockSize, childFragments};
  }
});
