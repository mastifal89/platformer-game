class Player extends Sprite {
  constructor({
    position,
    collisionBlocks,
    platformCollisionBlocks,
    imageSrc,
    frameRate = 1,
    scale = 0.5,
    animations,
  }) {
    super({ imageSrc, frameRate, scale });
    this.position = position;
    this.velocity = {
      x: 0,
      y: 1,
    };

    this.collisionBlocks = collisionBlocks;
    this.platformCollisionBlocks = platformCollisionBlocks;
    this.hitBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 10,
      height: 10,
    };
    this.animations = animations;
    this.lastDirection = "right";

    for (let key in this.animations) {
      const image = new Image();
      image.src = this.animations[key].imageSrc;
      this.animations[key].image = image;
    }

    this.cameraBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 200,
      height: 80,
    };
  }

  switchSprite(key) {
    if (this.image === this.animations[key].image || !this.loaded) return;

    this.currentFrame = 0;
    this.image = this.animations[key].image;
    this.frameRate = this.animations[key].frameRate;
    this.frameBuffer = this.animations[key].frameBuffer;
  }

  updateCameraBox() {
    this.cameraBox = {
      position: {
        x: this.position.x - 50,
        y: this.position.y,
      },
      width: 200,
      height: 80,
    };
  }

  checkForHorizontalCanvasCollision() {
    if (
      this.hitBox.position.x + this.hitBox.width + this.velocity.x >= 576 ||
      this.hitBox.position.x + this.velocity.x <= 0
    ) {
      this.velocity.x = 0;
    }
  }

  shouldPanCameraToTheLeft({ canvas, camera }) {
    const cameraboxRightSide = this.cameraBox.position.x + this.cameraBox.width;
    const scaledDownCanvasWidth = canvas.width / 4;

    if (cameraboxRightSide >= 576) return;

    if (
      cameraboxRightSide >=
      scaledDownCanvasWidth + Math.abs(camera.position.x)
    ) {
      camera.position.x -= this.velocity.x;
    }
  }

  shouldPanCameraToTheRight({ canvas, camera }) {
    if (this.cameraBox.position.x <= 0) return;

    if (this.cameraBox.position.x <= Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x;
    }
  }

  shouldPanCameraDown({ canvas, camera }) {
    if (this.cameraBox.position.y + this.velocity.y <= 0) return;

    if (this.cameraBox.position.y <= Math.abs(camera.position.y)) {
      camera.position.y -= this.velocity.y;
    }
  }

  shouldPanCameraUp({ canvas, camera }) {
    if (
      this.cameraBox.position.y + this.cameraBox.height + this.velocity.y >=
      432
    )
      return;

    const scaledCanvasHeight = canvas.height / 4;

    if (
      this.cameraBox.position.y + this.cameraBox.height >=
      Math.abs(camera.position.y) + scaledCanvasHeight
    ) {
      camera.position.y -= this.velocity.y;
    }
  }

  update() {
    this.updateFrame();
    this.updateHitBox();
    this.updateCameraBox();
    // c.fillStyle = "rgba(0,0,255,0.1)";
    // c.fillRect(
    //   this.cameraBox.position.x,
    //   this.cameraBox.position.y,
    //   this.cameraBox.width,
    //   this.cameraBox.height
    // );

    // draws out image
    /*c.fillStyle = "rgba(0,255,0,0.1)";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);

    c.fillStyle = "rgba(255,0,0,0.1)";
    c.fillRect(
      this.hitBox.position.x,
      this.hitBox.position.y,
      this.hitBox.width,
      this.hitBox.height
    );*/

    this.draw();
    this.position.x += this.velocity.x;
    this.updateHitBox();
    this.checkForHorizontalCollisions();
    this.applyGravity();
    this.updateHitBox();
    this.checkForVerticalCollisions();
  }

  updateHitBox() {
    this.hitBox = {
      position: {
        x: this.position.x + 35,
        y: this.position.y + 26,
      },
      width: 13,
      height: 27,
    };
  }

  checkForHorizontalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];

      if (
        collision({
          object1: this.hitBox,
          object2: collisionBlock,
        })
      ) {
        if (this.velocity.x > 0) {
          this.velocity.x = 0;

          const offset =
            this.hitBox.position.x - this.position.x + this.hitBox.width;

          this.position.x = collisionBlock.position.x - offset - 0.01;
          break;
        }

        if (this.velocity.x < 0) {
          this.velocity.x = 0;

          const offset = this.hitBox.position.x - this.position.x;

          this.position.x =
            collisionBlock.position.x + collisionBlock.width - offset + 0.01;
          break;
        }
      }
    }
  }

  applyGravity() {
    this.velocity.y += gravity;
    this.position.y += this.velocity.y;
  }
  checkForVerticalCollisions() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i];

      if (
        collision({
          object1: this.hitBox,
          object2: collisionBlock,
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0;

          const offset =
            this.hitBox.position.y - this.position.y + this.hitBox.height;

          this.position.y = collisionBlock.position.y - offset - 0.01;
          break;
        }

        if (this.velocity.y < 0) {
          this.velocity.y = 0;

          const offset = this.hitBox.position.y - this.position.y;

          this.position.y =
            collisionBlock.position.y + collisionBlock.height - offset + 0.01;
          break;
        }
      }
    }

    // platform collision blocks
    for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
      const platformCollisionBlock = this.platformCollisionBlocks[i];

      if (
        platformCollition({
          object1: this.hitBox,
          object2: platformCollisionBlock,
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0;

          const offset =
            this.hitBox.position.y - this.position.y + this.hitBox.height;

          this.position.y = platformCollisionBlock.position.y - offset - 0.01;
          break;
        }
      }
    }
  }
}
