registerPaint('corner', class {
  // TODO: 支持 --offset-end 设置距离底部或右侧的距离。
  static get inputProperties() {
    return [
      '--half-radius',
      '--offset-half',
      '--offset-start',
      '--corner-direction',
    ]
  }

  paint(context, geom, properties) {
    const halfRadius = properties.get('--half-radius') ? Number(properties.get('--half-radius').toString().replace(/[a-z]/gi, '')) : 0;
    const offsetHalf = properties.get('--offset-half') ? Number(properties.get('--offset-half').toString().replace(/[a-z]/gi, '')) : 0;
    const offsetStart = properties.get('--offset-start') ? Number(properties.get('--offset-start').toString().replace(/[a-z]/gi, '')) : 0;
    const cornerDirection = properties.get('--corner-direction').toString().trim();

    drawProgress(halfRadius, offsetHalf, offsetStart, cornerDirection);

    // 绘制
    function drawProgress(halfRadius, offsetHalf, offsetStart, cornerDirection) {
      let fillColor = '#000'
      const PI = Math.PI;
      const startAngle = 0;
      const endAngle = 2 * PI;
      const counterClockwise = false;

      context.clearRect(0, 0, geom.width, geom.height);
      context.beginPath();

      // 绘制矩形
      context.fillStyle = fillColor;
      context.fillRect(0, 0, geom.width, geom.height);

      // 垂直方向
      if (cornerDirection === 'column') {
        const startX = offsetHalf; // 顶部圆心 x 坐标
        const endX = geom.height - offsetHalf; // 底部圆心 x 坐标
        const x = offsetStart + halfRadius; // 圆心 y 坐标

        // 绘制顶部圆形
        context.fillStyle = 'blue';
        context.arc(x, startX, halfRadius, startAngle, endAngle, counterClockwise);

        // 绘制底部圆形
        context.fillStyle = 'blue';
        context.arc(x, endX, halfRadius, startAngle, endAngle, counterClockwise);
      } else {
        // 不写 --corner-direction 属性时，默认为水平方向
        const startX = offsetHalf; // 左侧圆心 x 坐标
        const endX = geom.width - offsetHalf; // 右侧圆心 x 坐标
        const y = offsetStart + halfRadius; // 圆心 y 坐标

        // 绘制左侧圆形
        context.fillStyle = 'blue';
        context.arc(startX, y, halfRadius, startAngle, endAngle, counterClockwise);

        // 绘制右侧圆形
        context.fillStyle = 'blue';
        context.arc(endX, y, halfRadius, startAngle, endAngle, counterClockwise);
      }

      // 设置组合方式（裁剪叠加图像）
      context.globalCompositeOperation = 'destination-out'
      context.fill();
    }
  }
})
