registerPaint('corner', class {
  static get inputProperties() {
    return [
      '--half-radius',
      '--offset-x',
      '--offset-y',
    ]
  }

  paint(context, geom, properties) {
    const halfRadius = properties.get('--half-radius') ? Number(properties.get('--half-radius').toString().replace(/[a-z]/gi, '')) : 0;
    const offsetX = properties.get('--offset-x') ? Number(properties.get('--offset-x').toString().replace(/[a-z]/gi, '')) : 0;
    const offsetY = properties.get('--offset-y') ? Number(properties.get('--offset-y').toString().replace(/[a-z]/gi, '')) : 0;

    drawProgress(halfRadius, offsetX, offsetY);

    // 绘制
    function drawProgress(halfRadius, offsetX, offsetY) {
      let fillColor = '#000'
      const PI = Math.PI;
      const startX = offsetX; // 左侧圆心 x坐标
      const endX = geom.width - offsetX; // 右侧圆心 x坐标
      const y = offsetY + halfRadius; // 圆心 y 坐标

      context.clearRect(0, 0, geom.width, geom.height);
      context.beginPath();

      // 绘制矩形
      context.fillStyle = fillColor;
      context.fillRect(0, 0, geom.width, geom.height);


      let startAngle = 0;
      let endAngle = 2 * PI;
      const counterClockwise = false;

      // 绘制左侧圆形
      context.fillStyle = 'blue';
      context.arc(startX, y, halfRadius, startAngle, endAngle, counterClockwise);

      // 绘制右侧圆形
      context.fillStyle = 'blue';
      context.arc(endX, y, halfRadius, startAngle, endAngle, counterClockwise);

      //设置组合方式（裁剪叠加图像）
      context.globalCompositeOperation = 'destination-out'

      context.fill();
    }
  }
})
