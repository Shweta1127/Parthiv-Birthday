class Fireworks {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.palette = ['#f4d35e', '#d96c75', '#73b8e5', '#c790e8', '#8fcf8b', '#f2f1e8'];
  }

  start() {
    if (this.running) return;
    this.running = true;
    const resize = () => { this.canvas.width = innerWidth; this.canvas.height = innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    this.canvas.classList.add('visible');
    this.animate();
    this.launch();
    this.launchTimer = setInterval(() => {
      if (!document.hidden && this.particles.length < 420) this.launch();
    }, 1100);
  }

  launch() {
    const color = this.palette[Math.floor(Math.random() * this.palette.length)];
    this.particles.push({
      kind: 'shell',
      x: this.canvas.width * (.14 + Math.random() * .72),
      y: this.canvas.height + 10,
      targetY: this.canvas.height * (.12 + Math.random() * .32),
      velocityY: -(7.5 + Math.random() * 3.5),
      color,
      trail: []
    });
  }

  explode(shell) {
    const style = Math.floor(Math.random() * 3);
    const count = style === 1 ? 78 : 58;
    for (let index = 0; index < count; index += 1) {
      const angle = (Math.PI * 2 * index) / count + Math.random() * .12;
      const speed = style === 2 ? 1.8 + Math.random() * 2.1 : 2.1 + Math.random() * 3.5;
      this.particles.push({
        kind: 'spark', x: shell.x, y: shell.y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        color: index % 7 === 0 ? '#fff9dc' : shell.color,
        alpha: 1,
        decay: style === 2 ? .006 + Math.random() * .006 : .010 + Math.random() * .012,
        drag: style === 1 ? .985 : .972,
        gravity: style === 2 ? .024 : .045,
        size: Math.random() < .12 ? 2.2 : 1.25,
        glitter: Math.random() < .32
      });
    }
  }

  updateShell(shell) {
    shell.trail.push({ x: shell.x, y: shell.y, alpha: 1 });
    if (shell.trail.length > 11) shell.trail.shift();
    shell.y += shell.velocityY;
    shell.velocityY += .035;
    return shell.y <= shell.targetY;
  }

  drawShell(shell) {
    const { context } = this;
    shell.trail.forEach((point, index) => {
      context.globalAlpha = (index / shell.trail.length) * .45;
      context.fillStyle = shell.color;
      context.fillRect(point.x - 1, point.y - 1, 2, 2);
    });
    context.globalAlpha = 1;
    context.fillStyle = '#fff8d9';
    context.beginPath(); context.arc(shell.x, shell.y, 2.5, 0, Math.PI * 2); context.fill();
  }

  updateSpark(spark) {
    spark.velocityX *= spark.drag;
    spark.velocityY = spark.velocityY * spark.drag + spark.gravity;
    spark.x += spark.velocityX;
    spark.y += spark.velocityY;
    spark.alpha -= spark.decay;
    return spark.alpha <= 0;
  }

  drawSpark(spark) {
    const { context } = this;
    const visibleAlpha = spark.glitter && Math.random() < .18 ? spark.alpha * .2 : spark.alpha;
    context.globalAlpha = Math.max(visibleAlpha, 0);
    context.fillStyle = spark.color;
    context.beginPath(); context.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2); context.fill();
  }

  animate() {
    const { context, canvas } = this;
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      const particle = this.particles[index];
      if (particle.kind === 'shell') {
        if (this.updateShell(particle)) { this.explode(particle); this.particles.splice(index, 1); }
        else this.drawShell(particle);
      } else if (this.updateSpark(particle)) this.particles.splice(index, 1);
      else this.drawSpark(particle);
    }
    context.globalAlpha = 1;
    if (this.running) requestAnimationFrame(() => this.animate());
  }
}
