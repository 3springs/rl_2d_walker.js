class Renderer {
  constructor(config, walker, floor) {
    this.config = config
    this.walkers = [walker]
    this.floor = foor

    this.main_screen = document.getElementById("main_screen");
    this.ctx = main_screen.getContext("2d");
    resetCamera();
  }

  resetCamera() {
    this.zoom = config.max_zoom_factor;
    this.translate_x = 0;
    this.translate_y = 280;
  }

  setFps(fps) {
    config.draw_fps = fps;
    if(this.draw_interval)
      clearInterval(this.draw_interval);
    if(fps > 0 && config.simulation_fps > 0) {
      this.draw_interval = setInterval(drawFrame, Math.round(1000/config.draw_fps));
    }
  }

  drawFrame() {
    var minmax = getMinMaxDistance();
    this.target_zoom = Math.min(config.max_zoom_factor, getZoom(minmax.min_x, minmax.max_x + 4, minmax.min_y + 2, minmax.max_y + 2.5));
    this.zoom += 0.1*(this.target_zoom - this.zoom);
    this.translate_x += 0.1*(1.5-minmax.min_x - this.translate_x);
    this.translate_y += 0.3*(minmax.min_y*this.zoom + 280 - this.translate_y);
    //this.translate_y = minmax.max_y*this.zoom + 150;
    this.ctx.clearRect(0, 0, this.main_screen.width, this.main_screen.height);
    this.ctx.save();
    this.ctx.translate(this.translate_x*this.zoom, this.translate_y);
    this.ctx.scale(this.zoom, -this.zoom);
    drawFloor();
    for(var k = config.population_size - 1; k >= 0 ; k--) {
      drawWalker(this.walkers[k]);
    }
    this.ctx.restore();
  }

  drawFloor() {
    this.ctx.strokeStyle = "#444";
    this.ctx.lineWidth = 1/this.zoom;
    this.ctx.beginPath();
    var floor_fixture = this.floor.GetFixtureList();
    this.ctx.moveTo(floor_fixture.m_shape.m_vertices[0].x, floor_fixture.m_shape.m_vertices[0].y);
    for(var k = 1; k < floor_fixture.m_shape.m_vertices.length; k++) {
      this.ctx.lineTo(floor_fixture.m_shape.m_vertices[k].x, floor_fixture.m_shape.m_vertices[k].y);
    }
    this.ctx.stroke();
  }

  drawWalker (walker) {
    var hue = walker.hue || 240
    this.ctx.strokeStyle = "hsl(" + hue + ",100%,0%)";
    this.ctx.fillStyle = "hsl("+hue+",45%,"+(100-15*walker.health/config.walker_health)+"%)";
    this.ctx.lineWidth = 1/this.zoom;

    // left legs and arms first
    drawRect(walker.left_leg.lower_leg);
    drawRect(walker.left_leg.upper_leg);
    drawRect(walker.left_arm.upper_arm);
    drawRect(walker.left_arm.lower_arm);

    this.ctx.lineWidth = walker.left_leg.frictionJoint.maxForce? 4/this.zoom : 1/this.zoom;
    drawRect(walker.left_leg.foot);
    this.ctx.lineWidth = 1/this.zoom;
    
    this.ctx.lineWidth = walker.left_arm.frictionJoint.maxForce? 4/this.zoom : 1/this.zoom;
    drawRect(walker.left_arm.hand);
    this.ctx.lineWidth = 1/this.zoom;
    
    // head
    drawRect(walker.head.neck);
    drawRect(walker.head.head);
    
    // torso
    drawRect(walker.torso.lower_torso);
    drawRect(walker.torso.upper_torso);
    
    // right legs and arms
    drawRect(walker.right_leg.upper_leg);
    drawRect(walker.right_leg.lower_leg);
    drawRect(walker.right_arm.upper_arm);
    drawRect(walker.right_arm.lower_arm);
    
    this.ctx.lineWidth = walker.right_leg.frictionJoint.maxForce? 4/this.zoom : 1/this.zoom;
    drawRect(walker.right_leg.foot);
    this.ctx.lineWidth = 1/this.zoom;
    this.ctx.lineWidth = walker.right_arm.frictionJoint.maxForce? 4/this.zoom : 1/this.zoom;
    drawRect(walker.right_arm.hand);
    this.ctx.lineWidth = 1/this.zoom;
  }

  drawRect(body) {
    // set strokestyle and fillstyle before call
    this.ctx.beginPath();
    var fixture = body.GetFixtureList();
    var shape = fixture.GetShape();
    var p0 = body.GetWorldPoint(shape.m_vertices[0]);
    this.ctx.moveTo(p0.x, p0.y);
    for(var k = 1; k < 4; k++) {
      var p = body.GetWorldPoint(shape.m_vertices[k]);
      this.ctx.lineTo(p.x, p.y);
    }
    this.ctx.lineTo(p0.x, p0.y);

    this.ctx.fill();
    this.ctx.stroke();
  }

  drawTest() {
    this.ctx.strokeStyle = "#000";
    this.ctx.fillStyle = "#666";
    this.ctx.lineWidth = 1;1
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 2);
    this.ctx.lineTo(2, 2);

    this.ctx.fill();
    this.ctx.stroke();

  }

  getMinMaxDistance() {
    var min_x = 9999;
    var max_x = -1;
    var min_y = 9999;
    var max_y = -1;
    for(var k = 0; k < this.walkers.length; k++) {
      if(this.walkers[k].health > 0) {
        var dist = this.walkers[k].torso.upper_torso.GetPosition();
        min_x = Math.min(min_x, dist.x);
        max_x = Math.max(max_x, dist.x);
        min_y = Math.min(min_y, this.walkers[k].low_foot_height, this.walkers[k].head_height);
        max_y = Math.max(max_y, dist.y);
      }
    }
    return {min_x:min_x, max_x:max_x, min_y:min_y, max_y:max_y};
  }

  getZoom(min_x, max_x, min_y, max_y) {
    var delta_x = Math.abs(max_x - min_x);
    var delta_y = Math.abs(max_y - min_y);
    var zoom = Math.min(this.main_screen.width/delta_x,this.main_screen.height/delta_y);
    return zoom;
  }
}
module.export = {Renderer}
