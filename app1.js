/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
    * @description      : 
    * @author           : Vejay
    * @group            : 
    * @created          : 6/1/2022
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 6/1/2022
    * - Author          : Vejay
    * - Modification    : 
 */

/**
 * Query for WebXR support. If there's no support for the `immersive-ar` mode,
 * show an error.
 */

 (async function() {
    const isArSessionSupported = navigator.xr && navigator.xr.isSessionSupported && await navigator.xr.isSessionSupported("immersive-ar");
    if (isArSessionSupported) {
      document.getElementById("enter-ar").addEventListener("click", window.app.activateXR)
    } else {
      onNoXRDevice();
    }
  })();
  
  /**
   * Container class to manage connecting to the WebXR Device API
   * and handle rendering on every frame.
   */
  class App {
    /**
     * Run when the Start AR button is pressed.
     */
    activateXR = async () => {
      try {
        // Initialize a WebXR session using "immersive-ar".
        this.xrSession = await navigator.xr.requestSession("immersive-ar", {
          requiredFeatures: ['hit-test', 'dom-overlay'],
          domOverlay: { root: document.body }
        });
  
        // Create the canvas that will contain our camera's background and our virtual scene.
        this.createXRCanvas();
  
        // With everything set up, start the app.
        await this.onSessionStarted();
      } catch(e) {
        onNoXRDevice();
      }
    }
  
    /**
     * Add a canvas element and initialize a WebGL context that is compatible with WebXR.
     */
    createXRCanvas() {
      this.canvas = document.createElement("canvas");
      document.body.appendChild(this.canvas);
      this.gl = this.canvas.getContext("webgl", {xrCompatible: true});
  
      this.xrSession.updateRenderState({
        baseLayer: new XRWebGLLayer(this.xrSession, this.gl)
      });
    }
  
    /**
     * Called when the XRSession has begun. Here we set up our three.js
     * renderer, scene, and camera and attach our XRWebGLLayer to the
     * XRSession and kick off the render loop.
     */
    onSessionStarted = async () => {
      // Add the `ar` class to our body, which will hide our 2D components
      document.body.classList.add('ar');
  
      // To help with working with 3D on the web, we'll use three.js.
      this.setupThreeJs();
  
      // Setup an XRReferenceSpace using the "local" coordinate system.
      this.localReferenceSpace = await this.xrSession.requestReferenceSpace('local');
  
      // Create another XRReferenceSpace that has the viewer as the origin.
      this.viewerSpace = await this.xrSession.requestReferenceSpace('viewer');
      // Perform hit testing using the viewer as origin.
      this.hitTestSource = await this.xrSession.requestHitTestSource({ space: this.viewerSpace });
  
      // Start a rendering loop using this.onXRFrame.
      this.xrSession.requestAnimationFrame(this.onXRFrame);
  
      this.xrSession.addEventListener("select", this.onSelect);
      this.xrSession.addEventListener("click", this.onClick);
  
      this.globeObjectPresent = 0;
    }
  
    /** Place object when the screen is tapped. */
    onSelect = () => {
          if (window.globe && this.globeObjectPresent === 0) {
      
            this.globeObjectPresent = 1;
            this.clone = window.globe.clone();
            this.clone.position.copy(this.reticle.position);
            this.scene.add(this.clone);
            this.scene.remove(this.reticle);
            this.globeObjectSelected = true;
            this.scene.add(this.clone);
            
          }
          else if (window.globe && this.globeObjectPresent === 1){
            this.clone2 = window.hotel.clone(); 
            this.clone2.position.copy(this.clone.position);
            this.scene.remove(this.clone);
            this.scene.add(this.clone2);
            this.globeObjectPresent = 2;
            this.hotelObjectPresent = 1;
          }
          else if (window.globe && this.hotelObjectPresent === 1){
            this.hotelObjectPresent = 2;
            fetch('https://private-fd5ec2-hotelreality.apiary-mock.com/hreality/kpi/opera/npl')
              .then(response => response.json())
              .then(data => {
                  this.kpi_2 = "  Hotel OPERA Naples" + "\n";
                  for(let i = 0; i < data[0].level1.length; i++)
                  {
                    this.kpi_2 = this.kpi_2.concat("  " + data[0].level1[i].fullName, " : ",  data[0].level1[i].value, "\n");
                  }
                  document.getElementById("kpi-test").value = this.kpi_2;
                  document.body.classList.add('kpi-test');
              })
              .catch(err => {
                  console.error('An error ocurred in KPI fetch', err);
              });
          }
          else if (window.globe && this.hotelObjectPresent === 2){
            this.hotelObjectPresent = 3;
            fetch('https://private-fd5ec2-hotelreality.apiary-mock.com/hreality/kpi/opera/npl')
              .then(response => response.json())
              .then(data => {
                  this.kpi_2 = "  Hotel OPERA Naples" + "\n" + "  Energy Management" + "\n";
                  for(let i = 0; i < data[0].level2[0].values.length; i++)
                  {
                    this.kpi_2 = this.kpi_2.concat("  " + data[0].level2[0].values[i].name, " : ",  data[0].level2[0].values[i].value, "\n");
                  }
                  document.getElementById("kpi-test").value = this.kpi_2;
                  document.body.classList.add('kpi-test');
              })
              .catch(err => {
                  console.error('An error ocurred in KPI fetch', err);
              });
          }
          else if (window.globe && this.hotelObjectPresent === 3){
            this.hotelObjectPresent = 4;
            this.scene.remove(this.clone2);
            document.body.classList.remove('kpi-test');
            this.scene.add(this.clone);
          }
          else if (window.globe && this.hotelObjectPresent === 4){
            this.hotelObjectPresent = 5;
            this.scene.remove(this.clone);
            this.scene.add(this.clone2);
          }
          else if (window.globe && this.hotelObjectPresent === 5){
            this.hotelObjectPresent = 6;
            fetch('https://private-fd5ec2-hotelreality.apiary-mock.com/hreality/kpi/opera/hyd')
              .then(response => response.json())
              .then(data => {
                  this.kpi_3 = "  Hotel OPERA Hyderabad" + "\n";
                  for(let i = 0; i < data[0].level1.length; i++)
                  {
                    this.kpi_3 = this.kpi_3.concat("  " + data[0].level1[i].fullName, " : ",  data[0].level1[i].value, "\n");
                  }
                  document.getElementById("kpi-test").value = this.kpi_3;
                  document.body.classList.add('kpi-test');
              })
              .catch(err => {
                  console.error('An error ocurred in KPI fetch', err);
              });
          }
          else if (window.globe && this.hotelObjectPresent === 6){
            this.hotelObjectPresent = 7;
            fetch('https://private-fd5ec2-hotelreality.apiary-mock.com/hreality/kpi/opera/hyd')
              .then(response => response.json())
              .then(data => {
                  this.kpi_2 = "  Hotel OPERA Hyderabad" + "\n" + "  Energy Management" + "\n";
                  for(let i = 0; i < data[0].level2[0].values.length; i++)
                  {
                    this.kpi_2 = this.kpi_2.concat("  " + data[0].level2[0].values[i].name, " : ",  data[0].level2[0].values[i].value, "\n");
                  }
                  document.getElementById("kpi-test").value = this.kpi_2;
                  document.body.classList.add('kpi-test');
              })
              .catch(err => {
                  console.error('An error ocurred in KPI fetch', err);
              });
          }
    }
  
    /**
     * Called on the XRSession's requestAnimationFrame.
     * Called with the time and XRPresentationFrame.
     */
    onXRFrame = (time, frame) => {
      // Queue up the next draw request.
      this.xrSession.requestAnimationFrame(this.onXRFrame);
  
      // Bind the graphics framebuffer to the baseLayer's framebuffer.
      const framebuffer = this.xrSession.renderState.baseLayer.framebuffer
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
      this.renderer.setFramebuffer(framebuffer);
  
      // Retrieve the pose of the device.
      // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
      const pose = frame.getViewerPose(this.localReferenceSpace);
      if (pose) {
        // In mobile AR, we only have one view.
        const view = pose.views[0];
  
        const viewport = this.xrSession.renderState.baseLayer.getViewport(view);
        this.renderer.setSize(viewport.width, viewport.height)
  
        // Use the view's transform matrix and projection matrix to configure the THREE.camera.
        this.camera.matrix.fromArray(view.transform.matrix)
        this.camera.projectionMatrix.fromArray(view.projectionMatrix);
        this.camera.updateMatrixWorld(true);
  
        // Conduct hit test.
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
  
        // If we have results, consider the environment stabilized.
        if (!this.stabilized && hitTestResults.length > 0) {
          this.stabilized = true;
          document.body.classList.add('stabilized');
        }
        if (hitTestResults.length > 0) {
          const hitPose = hitTestResults[0].getPose(this.localReferenceSpace);
  
          // Update the reticle position
          this.reticle.visible = true;
          this.reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
          this.reticle.updateMatrixWorld(true);
        }
  
        // Render the scene with THREE.WebGLRenderer.
        this.renderer.render(this.scene, this.camera);
      }
    }
    
  
    /**
     * Initialize three.js specific rendering code, including a WebGLRenderer,
     * a demo scene, and a camera for viewing the 3D content.
     */
    setupThreeJs() {
      // To help with working with 3D on the web, we'll use three.js.
      // Set up the WebGLRenderer, which handles rendering to our session's base layer.
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        preserveDrawingBuffer: true,
        canvas: this.canvas,
        context: this.gl
      });
      this.renderer.autoClear = false;
  
      // Initialize our scene.
      this.scene = HotelUtils.createLitScene();
      this.reticle = new Reticle();
      this.scene.add(this.reticle);
  
      // We'll update the camera matrices directly from API, so
      // disable matrix auto updates so three.js doesn't attempt
      // to handle the matrices independently.
      this.camera = new THREE.PerspectiveCamera();
      this.camera.matrixAutoUpdate = false;
    }
  };
  
window.app = new App();
