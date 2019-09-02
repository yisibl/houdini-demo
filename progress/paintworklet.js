// 对角线
registerPaint('line', class {
  static get inputProperties() {
    return ["--line-color", '--line-width', '--line-style'];
  }

  paint(ctx, geom, properties) {
    const lineColor = properties.get('--line-color') ? properties.get('--line-color').toString() : 'rgba(0, 0, 0, 0)';
    const lineWidth = properties.get('--line-width') ? properties.get('--line-width').toString().replace(/[a-z]/gi, '') : 1;
    const lineStyle = properties.get('--line-style') ? properties.get('--line-style').toString().trim().replace(/'|"/g, '') : '';


    const width = geom.width;
    const height = geom.height;

    //  绘制 \
    ctx.beginPath();

    ctx.clearRect(0, 0, geom.width, geom.height);
    if (lineStyle === 'to left bottom') {
      ctx.moveTo(0, 0);
      ctx.lineTo(width, height);
    }
    //  绘制 /
    if (lineStyle === 'to right bottom') {
      ctx.moveTo(0, height);
      ctx.lineTo(width, 0);
    }
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.stroke();
  }
});

// 进度条

registerPaint('progress', class {
  static get inputProperties() {
    const props = ['--percentage', '--fill-color', '--track-color', '--stroke-color', '--stroke-style', '--stroke-width', '--stroke-rotate'];
    return props;
  }

  // cssString now renamed to cssText
  // https://bugs.chromium.org/p/chromium/issues/detail?id=545318#c65
  paint(context, geom, styleMap) {
    const fillColor = styleMap.get('--fill-color') ? styleMap.get('--fill-color').toString() : 'rgba(0, 0, 0, 0)';
    const trackColor = styleMap.get('--track-color') ? styleMap.get('--track-color').toString() : 'rgba(0, 0, 0, 0)';
    const strokeColor = styleMap.get('--stroke-color') ? styleMap.get('--stroke-color').toString() : 'rgba(0, 0, 0, 0)';
    let strokeStyle = styleMap.get('--stroke-style') ? styleMap.get('--stroke-style').toString().trim().replace(/'|"/g, '') : 'round';
    debugger

    if (strokeStyle === '') strokeStyle = 'round'

    const percentage = styleMap.get('--percentage') ? parseInt(styleMap.get('--percentage').toString()) : 100;

    const strokeWidth = styleMap.get('--stroke-width') ? styleMap.get('--stroke-width').toString() : 0;
    let strokeRotate = styleMap.get('--stroke-rotate').toString().replace(/[a-z]/gi, '');

    drawProgress(strokeColor, strokeWidth, strokeStyle, strokeRotate, trackColor, fillColor, percentage);

    // 绘制
    function drawProgress(strokeColor, strokeWidth, strokeStyle, strokeRotate, trackColor, fillColor, progress) {

      const PI = Math.PI;
      const x = geom.width / 2; // 圆心 x 坐标
      const y = geom.height / 2; // 圆心 y 坐标
      const halfRadius = Math.min(x / 2, y / 2);

      let lineWidth = strokeWidth;
      if (lineWidth.match(/.+%/g)) {
        let lineX = parseFloat(lineWidth) / 100 * x;
        let lineY = parseFloat(lineWidth) / 100 * y;
        lineWidth = Math.min(lineX, lineY);
      } else {
        lineWidth = lineWidth.replace(/[a-z]/gi, '');
      }

      let offseX = x - lineWidth;
      let offseY = y - lineWidth;

      if (lineWidth > Math.min(x, y)) {
        lineWidth = Math.min(x, y);
      }

      // 绘制内圆
      let radius = Math.min(offseX, offseY); // 半径
      if (radius < 0) {
        radius = halfRadius;
        fillColor = 'rgba(0, 0, 0, 0)';
      }
      // console.log(radius)
      let startAngle = 0;
      let endAngle = 2 * PI;
      const counterClockwise = false;

      context.clearRect(0, 0, geom.width, geom.height);
      context.beginPath();
      context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
      context.fillStyle = fillColor;
      context.fill();

      if (lineWidth > 0) {
        // 绘制背景轨道
        radius = Math.min(x - lineWidth / 2, y - lineWidth / 2);
        if (radius < halfRadius) {
          radius = halfRadius;
        }
        const angle = 1.5 * PI + (strokeRotate / 180 * PI); // 设置起始点为正上方，弧形的三点钟位置是 0 度;
        const trackStartAngle = angle + (2 * PI) * progress / 100;;
        const trackEndAngle = angle;
        context.beginPath();
        context.arc(x, y, radius, trackStartAngle, trackEndAngle, counterClockwise);
        context.lineWidth = lineWidth;

        context.lineCap = 'butt'; // butt, round or square
        context.strokeStyle = trackColor;
        context.stroke();

        // 绘制进度条
        context.beginPath();
        context.arc(x, y, radius, trackEndAngle, trackStartAngle, counterClockwise);
        // 绘制进度条描边
        context.lineWidth = lineWidth;
        context.lineCap = strokeStyle;
        context.strokeStyle = strokeColor;
        context.stroke();
      }
    }
  }
});

// Different color based on size
// Inside PaintWorkletGlobalScope.
// registerPaint('heading-color', class {
//   static get inputProperties() {
//     return [];
//   }

//   paint(ctx, geom, properties) {
//     // Select a color based on the width and height of the image.
//     const width = geom.width;
//     const height = geom.height;
//     // const color = colorArray[(width * height) % colorArray.length];
//     const color = randomColor()

//     console.log(color)

//     // Draw just a solid image.
//     ctx.fillStyle = color;
//     ctx.fillRect(0, 0, width, height);

//     function randomColor() {
//       return '#' + ('00000' +
//         (Math.random(width * height) * 0x1000000 | 0).toString(16)).slice(-6);
//     }
//   }
// });


