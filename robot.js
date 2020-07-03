'use strict';

async function main(tank) {
  const measure = {
    angle: 0,
    range: 0,
  };

  async function radar(tank) {
    measure.angle += 15;
    measure.range = await tank.scan(measure.angle, 10);
    if (measure.angle === 360) measure.angle = 0;
  }

  async function attack(tank) {
    const recoil = 30;

    if (measure.range !== 0) {
      await stop(tank);
      await tank.shoot(measure.angle, measure.range);
      measure.angle -= recoil;
    }
  }

  async function updatePosition(tank) {
    const position = {
      x: await tank.getX(),
      y: await tank.getY(),
    };

    return position;
  }

  async function checkLimit(position) {
    const limit = {
      top: 800,
      bottom: 200,
      left: 200,
      right: 1140,
    };

    if (
      position.x > limit.right ||
      position.y > limit.top ||
      position.x < limit.left ||
      position.y < limit.bottom
    ) {
      return true;
    }
  }

  async function changeDirection(tank) {
    if (measure.angle > 225 && measure.angle < 315) {
      await move(tank, 90);
    } else if (measure.angle > 45 && measure.angle < 135) {
      await move(tank, 270);
    } else if (measure.angle > 135 && measure.angle < 225) {
      await move(tank, 360);
    } else {
      await move(tank, 180);
    }
  }

  async function move(tank, angle) {
    const speed = 90;
    await tank.drive(angle, speed);
  }

  async function stop(tank) {
    while ((await tank.getSpeed()) > 50) await tank.drive(measure.angle, 0);
  }

  while (true) {
    await radar(tank);
    await attack(tank);

    if (await checkLimit(await updatePosition(tank))) {
      await stop(tank);
      await changeDirection(tank);
    }

    await move(tank, measure.angle);
  }
}
