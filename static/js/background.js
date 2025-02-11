const AnimConfig = {
    nodeCount: 500,
    maxConnectionsPerNode: 8,
    particleCount: 500,
    nodeOpacity: 0.8,
    linkOpacity: 0.5,
    particleOpacity: 0.6,
    textOpacity: 0.8,
    nodeSpeed: 0.2,
    particleSpeed: 0.15,
    nodeSize: 6,
    particleSize: 1.5,
    sideMargin: 0.5,
    proximityDistance: 100,
    intersectionDistance: 30
};

class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(point) {
        return point.x >= this.x && point.x < this.x + this.width &&
            point.y >= this.y && point.y < this.y + this.height;
    }

    intersects(range) {
        return !(range.x > this.x + this.width ||
            range.x + range.width < this.x ||
            range.y > this.y + this.height ||
            range.y + range.height < this.y);
    }
}

class Quadtree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }

    subdivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.width / 2;
        const h = this.boundary.height / 2;

        const ne = new Rectangle(x + w, y, w, h);
        const nw = new Rectangle(x, y, w, h);
        const se = new Rectangle(x + w, y + h, w, h);
        const sw = new Rectangle(x, y + h, w, h);

        this.northeast = new Quadtree(ne, this.capacity);
        this.northwest = new Quadtree(nw, this.capacity);
        this.southeast = new Quadtree(se, this.capacity);
        this.southwest = new Quadtree(sw, this.capacity);
        this.divided = true;
    }

    insert(point) {
        if (!this.boundary.contains(point)) return false;

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) this.subdivide();

        return (this.northeast.insert(point) ||
            this.northwest.insert(point) ||
            this.southeast.insert(point) ||
            this.southwest.insert(point));
    }

    query(range, found = []) {
        if (!this.boundary.intersects(range)) return found;

        for (const point of this.points) {
            if (range.contains(point)) found.push(point);
        }

        if (this.divided) {
            this.northwest.query(range, found);
            this.northeast.query(range, found);
            this.southwest.query(range, found);
            this.southeast.query(range, found);
        }

        return found;
    }
}

class Node {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        const speed = (Math.random() + 0.5) * AnimConfig.nodeSpeed;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.radius = AnimConfig.nodeSize;
        this.connections = new Map();
        this.prevX = x;
        this.prevY = y;
        this.mass = Math.PI * this.radius * this.radius; // Mass proportional to area
    }

    update(width, height, nodes) {
        this.prevX = this.x;
        this.prevY = this.y;

        for (const other of nodes) {
            if (other !== this && this.checkCollision(other)) {
                this.resolveCollision(other);
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -1;
        }
        if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -1;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -1;
        }
        if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy *= -1;
        }
    }

    checkCollision(other) {
        const dist = Math.hypot(this.x - other.x, this.y - other.y);
        return dist < this.radius + other.radius;
    }

    resolveCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1e-8) return;
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (this.radius + other.radius - dist);

        this.x -= nx * overlap * 0.5;
        this.y -= ny * overlap * 0.5;
        other.x += nx * overlap * 0.5;
        other.y += ny * overlap * 0.5;

        // Calculate relative velocity
        const rvx = other.vx - this.vx;
        const rvy = other.vy - this.vy;
        const velAlongNormal = rvx * nx + rvy * ny;

        // Only resolve if objects are moving towards each other
        if (velAlongNormal > 0) return;

        // Calculate restitution (bounciness)
        const e = 0.9;

        // Calculate impulse scalar
        const m1 = this.mass;
        const m2 = other.mass;
        const j = -(1 + e) * velAlongNormal;
        const jn = j / (m1 + m2);

        // Apply impulse
        this.vx -= jn * m2 * nx;
        this.vy -= jn * m2 * ny;
        other.vx += jn * m1 * nx;
        other.vy += jn * m1 * ny;

        // Apply minimum velocity threshold
        const minVelocity = 0.01;
        if (Math.hypot(this.vx, this.vy) < minVelocity) {
            this.vx = 0;
            this.vy = 0;
        }
        if (Math.hypot(other.vx, other.vy) < minVelocity) {
            other.vx = 0;
            other.vy = 0;
        }
    }

    intersects(other) {
        const x1 = this.prevX;
        const y1 = this.prevY;
        const x2 = this.x;
        const y2 = this.y;
        const x3 = other.prevX;
        const y3 = other.prevY;
        const x4 = other.x;
        const y4 = other.y;

        const dx1 = x2 - x1;
        const dy1 = y2 - y1;
        const dx2 = x4 - x3;
        const dy2 = y4 - y3;
        const dx3 = x1 - x3;
        const dy3 = y1 - y3;

        const d = dx1 * dy2 - dy1 * dx2;
        if (Math.abs(d) < 1e-8) return false;

        const t1 = (dx2 * dy3 - dy2 * dx3) / d;
        const t2 = (dx1 * dy3 - dy1 * dx3) / d;

        const dist = Math.hypot(
            x1 + dx1 * t1 - (x3 + dx2 * t2),
            y1 + dy1 * t1 - (y3 + dy2 * t2)
        );

        return dist < AnimConfig.intersectionDistance &&
            t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1;
    }
}

class BackgroundAnimation {
    constructor(canvas, data) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true });
        this.data = data;
        this.lastTime = 0;
        this.frameCount = 0;
        this.nodes = [];
        this.particles = [];

        this.resize();
        this.init();
        this.animate(0);

        window.addEventListener('resize', () => {
            this.resize();
            this.nodes = [];
            this.particles = [];
            this.init();
        });

        const observer = new MutationObserver(() => {
            requestAnimationFrame(() => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            });
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
    }

    init() {
        if (this.data && this.data.skill_set) {
            const nodes = Object.values(this.data.skill_set).flat();
            const selectedNodes = [...nodes]
                .sort(() => Math.random() - 0.5)
                .slice(0, AnimConfig.nodeCount);

            selectedNodes.forEach(text => {
                const margin = -300;
                const width = this.canvas.width + Math.abs(margin) * 2;
                const height = this.canvas.height + Math.abs(margin) * 2;
                const x = margin + Math.random() * width;
                const y = margin + Math.random() * height;
                this.nodes.push(new Node(x, y, text));
            });

            for (let i = 0; i < AnimConfig.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: Math.random() * AnimConfig.particleSize,
                    vx: (Math.random() - 0.5) * AnimConfig.particleSpeed,
                    vy: (Math.random() - 0.5) * AnimConfig.particleSpeed
                });
            }
        }
    }

    drawNode(node) {
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
        const opacity = getComputedStyle(document.documentElement).getPropertyValue('--animation-opacity').trim();

        node.connections.forEach((connectionOpacity, connected) => {
            const distance = Math.hypot(connected.x - node.x, connected.y - node.y);
            const distanceOpacity = Math.max(0, 1 - distance / 300);
            const finalOpacity = distanceOpacity * connectionOpacity * parseFloat(opacity);

            this.ctx.beginPath();
            this.ctx.moveTo(node.x, node.y);
            this.ctx.lineTo(connected.x, connected.y);
            this.ctx.strokeStyle = `${accentColor}${Math.round(finalOpacity * 255).toString(16).padStart(2, '0')}`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });

        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `${accentColor}${Math.round(parseFloat(opacity) * 255).toString(16).padStart(2, '0')}`;
        this.ctx.fill();

        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = `${textColor}${Math.round(parseFloat(opacity) * 255).toString(16).padStart(2, '0')}`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(node.text, node.x, node.y + 20);
    }

    updateParticles() {
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        const opacity = getComputedStyle(document.documentElement).getPropertyValue('--animation-opacity').trim();

        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `${accentColor}${Math.round(parseFloat(opacity) * 255).toString(16).padStart(2, '0')}`;
            this.ctx.fill();
        });
    }

    updateConnections() {
        const FADE_SPEED = 0.1;

        this.nodes.forEach((node, i) => {
            this.nodes.slice(i + 1).forEach(other => {
                if (node.connections.size >= AnimConfig.maxConnectionsPerNode ||
                    other.connections.size >= AnimConfig.maxConnectionsPerNode) return;

                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const distance = Math.hypot(dx, dy);

                const shouldBeConnected = distance < AnimConfig.proximityDistance || node.intersects(other);

                if (shouldBeConnected) {
                    if (!node.connections.has(other)) {
                        node.connections.set(other, 0);
                        other.connections.set(node, 0);
                    }
                    const currentOpacity = node.connections.get(other);
                    const newOpacity = Math.min(1, currentOpacity + FADE_SPEED);
                    node.connections.set(other, newOpacity);
                    other.connections.set(node, newOpacity);
                } else if (node.connections.has(other)) {
                    const currentOpacity = node.connections.get(other);
                    const newOpacity = Math.max(0, currentOpacity - FADE_SPEED);

                    if (newOpacity <= 0) {
                        node.connections.delete(other);
                        other.connections.delete(node);
                    } else {
                        node.connections.set(other, newOpacity);
                        other.connections.set(node, newOpacity);
                    }
                }
            });
        });
    }

    animate(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.frameCount++;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateConnections();

        this.nodes.forEach(node => {
            node.update(this.canvas.width, this.canvas.height, this.nodes);
            this.drawNode(node);
        });

        this.updateParticles();

        requestAnimationFrame((timestamp) => this.animate(timestamp));
    }
}

export { BackgroundAnimation };

