import {
  Behaviour,
  GameObject,
  showBalloonMessage,
  registerType,
  NeedleEngine,
  DragControls,
} from '@needle-tools/engine';
import { AxesHelper, GridHelper } from 'three';
import * as THREE from 'three';
import { SVGLoader, SVGResult } from "three/examples/jsm/loaders/SVGLoader";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

@registerType
export class Rotate extends Behaviour {
  start() {
    console.log(this);
    showBalloonMessage('Hello Cube');
  }
  update(): void {
    this.gameObject.rotateY(this.context.time.deltaTime);
  }
}

function extractColor(svgCircle) {
  // Extracting the fill attribute
  var fillMatch = svgCircle.match(
    /fill:\s*rgb\((\d+),\s*(\d+),\s*(\d+)\);/
  );

  var hexColor = "0x000000";
  // Check if there is a match
  if (fillMatch) {
    // Extract RGB values
    var red = parseInt(fillMatch[1]);
    var green = parseInt(fillMatch[2]);
    var blue = parseInt(fillMatch[3]);

    // Convert RGB to hex
    hexColor =
      "#" +
      ((1 << 24) + (red << 16) + (green << 8) + blue)
        .toString(16)
        .slice(1);
  } else {
    console.log(
      "No fill attribute with RGB values found in the given string."
    );
  }

  return hexColor;
}

async function renderSVG(svgGroup, extrusion, svg) {
  const loader = new SVGLoader();
  const svgData: SVGResult = loader.parse(svg);


  const updateMap: any = [];

  svgGroup.scale.y *= -1;
  svgData.paths.forEach((path) => {
    const shapes = SVGLoader.createShapes(path);

    shapes.forEach((shape) => {
      const meshGeometry = new THREE.ExtrudeGeometry(shape, {
        depth: extrusion,
        bevelEnabled: true,
        steps: 1,
      });
      const fillMaterial = new THREE.MeshBasicMaterial({
        color: "#F3FBFB",
      });
      if (path.userData?.style.fill != "none")
        fillMaterial.color.set(String(path.userData?.style.fill));

      if (path.userData?.node.nodeName === "circle") {
        fillMaterial.color.set(
          String(extractColor(path.userData.node.outerHTML))
        );
      }
      // Avoid fill color NONE
      if (path.userData?.node.nodeName === "rect") {
        fillMaterial.color.set(String(path.userData.style.fill));
      }
      const linesGeometry = new THREE.EdgesGeometry(meshGeometry);
      const mesh = new THREE.Mesh(meshGeometry, fillMaterial);
      const stokeMaterial = new THREE.LineBasicMaterial({
        color: "#00A5E6",
      });
      const lines = new THREE.LineSegments(linesGeometry, stokeMaterial);

      // updateMap.push({ shape, mesh, lines });
      // svgGroup.add(mesh, lines);

      const box = new THREE.Box3().setFromObject(svgGroup);
      const size = box.getSize(new THREE.Vector3());
      const yOffset = size.y / -2;
      const xOffset = size.x / -2;

      // Offset all of group's elements, to center them
      svgGroup.children.forEach((item) => {
        item.position.x = xOffset;
        item.position.y = yOffset;
      });
      svgGroup.rotateX(-Math.PI / 2);
      
    });
  });

  return {
    object: svgGroup,
    update(extrusion) {
      updateMap.forEach((updateDetails) => {
        const meshGeometry = new THREE.ExtrudeGeometry(
          updateDetails.shape,
          {
            depth: extrusion,
            bevelEnabled: false,
          }
        );
        const linesGeometry = new THREE.EdgesGeometry(meshGeometry);

        updateDetails.mesh.geometry.dispose();
        updateDetails.lines.geometry.dispose();
        updateDetails.mesh.geometry = meshGeometry;
        updateDetails.lines.geometry = linesGeometry;
      });
    },
  };
}

NeedleEngine.addContextCreatedCallback((args) => {
  const context = args.context;
  const scene = context.scene;

  // Bar chart
  const svgBar = `<svg id="test1" width="880" height="300"><g transform="translate(60,10)"><g transform="translate(0,260)" fill="none" font-size="10" font-family="sans-serif" text-anchor="middle"><path class="domain" stroke="currentColor" d="M0.5,6V0.5H790.5V6"></path><g class="tick" opacity="1" transform="translate(61.8674698795181,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">Los Angeles</text></g><g class="tick" opacity="1" transform="translate(157.04819277108436,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">Seattle</text></g><g class="tick" opacity="1" transform="translate(252.22891566265062,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">Mountain View</text></g><g class="tick" opacity="1" transform="translate(347.40963855421694,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">Chicago</text></g><g class="tick" opacity="1" transform="translate(442.5903614457832,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">New York</text></g><g class="tick" opacity="1" transform="translate(537.7710843373494,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">Austin</text></g><g class="tick" opacity="1" transform="translate(632.9518072289158,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">Palo Alto</text></g><g class="tick" opacity="1" transform="translate(728.132530120482,0)"><line stroke="currentColor" y2="6"></line><text fill="currentColor" y="9" dy="0.71em">San Francisco</text></g></g><g fill="none" font-size="10" font-family="sans-serif" text-anchor="end"><path class="domain" stroke="currentColor" d="M-6,260.5H0.5V0.5H-6"></path><g class="tick" opacity="1" transform="translate(0,260.5)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">0</text></g><g class="tick" opacity="1" transform="translate(0,236.86363636363635)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">10</text></g><g class="tick" opacity="1" transform="translate(0,213.22727272727272)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">20</text></g><g class="tick" opacity="1" transform="translate(0,189.5909090909091)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">30</text></g><g class="tick" opacity="1" transform="translate(0,165.95454545454544)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">40</text></g><g class="tick" opacity="1" transform="translate(0,142.3181818181818)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">50</text></g><g class="tick" opacity="1" transform="translate(0,118.68181818181819)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">60</text></g><g class="tick" opacity="1" transform="translate(0,95.04545454545455)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">70</text></g><g class="tick" opacity="1" transform="translate(0,71.4090909090909)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">80</text></g><g class="tick" opacity="1" transform="translate(0,47.77272727272726)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">90</text></g><g class="tick" opacity="1" transform="translate(0,24.136363636363644)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">100</text></g><g class="tick" opacity="1" transform="translate(0,0.5)"><line stroke="currentColor" x2="-6"></line><text fill="currentColor" x="-9" dy="0.32em">110</text></g></g><g><g fill="#7A77FF"><rect x="28.554216867469904" y="0" height="260" width="66.62650602409639" fill="#FF0000"></rect><rect x="123.73493975903617" y="21.272727272727266" height="238.72727272727275" width="66.62650602409639"></rect><rect x="218.91566265060243" y="25.999999999999993" height="234" width="66.62650602409639"></rect><rect x="314.0963855421687" y="35.45454545454545" height="224.54545454545456" width="66.62650602409639"></rect><rect x="409.27710843373495" y="37.81818181818183" height="222.1818181818182" width="66.62650602409639"></rect><rect x="504.4578313253012" y="61.454545454545446" height="198.54545454545456" width="66.62650602409639"></rect><rect x="599.6385542168675" y="78.00000000000001" height="182" width="66.62650602409639"></rect><rect x="694.8192771084338" y="89.81818181818181" height="170.1818181818182" width="66.62650602409639"></rect></g></g></g></svg>`;
  const svgScatterSmall = `<svg width="500" height="400"><g transform="translate(100,100)"><g transform="translate(0,200)" fill="none" font-size="10" font-family="sans-serif" text-anchor="middle"><path class="domain" stroke="#000" d="M0.5,6V0.5H300.5V6"></path><g class="tick" opacity="1" transform="translate(0.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">0</text></g><g class="tick" opacity="1" transform="translate(30.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">10</text></g><g class="tick" opacity="1" transform="translate(60.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">20</text></g><g class="tick" opacity="1" transform="translate(90.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">30</text></g><g class="tick" opacity="1" transform="translate(120.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">40</text></g><g class="tick" opacity="1" transform="translate(150.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">50</text></g><g class="tick" opacity="1" transform="translate(180.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">60</text></g><g class="tick" opacity="1" transform="translate(210.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">70</text></g><g class="tick" opacity="1" transform="translate(240.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">80</text></g><g class="tick" opacity="1" transform="translate(270.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">90</text></g><g class="tick" opacity="1" transform="translate(300.5,0)"><line stroke="#000" y2="6"></line><text fill="#000" y="9" dy="0.71em">100</text></g></g><g fill="none" font-size="10" font-family="sans-serif" text-anchor="end"><path class="domain" stroke="#000" d="M-6,200.5H0.5V0.5H-6"></path><g class="tick" opacity="1" transform="translate(0,200.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">0</text></g><g class="tick" opacity="1" transform="translate(0,180.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">20</text></g><g class="tick" opacity="1" transform="translate(0,160.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">40</text></g><g class="tick" opacity="1" transform="translate(0,140.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">60</text></g><g class="tick" opacity="1" transform="translate(0,120.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">80</text></g><g class="tick" opacity="1" transform="translate(0,100.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">100</text></g><g class="tick" opacity="1" transform="translate(0,80.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">120</text></g><g class="tick" opacity="1" transform="translate(0,60.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">140</text></g><g class="tick" opacity="1" transform="translate(0,40.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">160</text></g><g class="tick" opacity="1" transform="translate(0,20.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">180</text></g><g class="tick" opacity="1" transform="translate(0,0.5)"><line stroke="#000" x2="-6"></line><text fill="#000" x="-9" dy="0.32em">200</text></g></g></g><text x="250" y="100" text-anchor="middle" style="font-family: Helvetica; font-size: 20px;">Scatter Plot</text><text x="250" y="335" text-anchor="middle" style="font-family: Helvetica; font-size: 12px;">Independant</text><text text-anchor="middle" transform="translate(60,200)rotate(-90)" style="font-family: Helvetica; font-size: 12px;">Dependant</text><g><circle cx="270" cy="180" r="2" transform="translate(100,100)" style="fill: rgb(204, 0, 0);"></circle><circle cx="60" cy="100" r="2" transform="translate(100,100)" style="fill: rgb(204, 0, 0);"></circle><circle cx="198" cy="156" r="2" transform="translate(100,100)" style="fill: rgb(204, 0, 0);"></circle><circle cx="159" cy="120" r="2" transform="translate(100,100)" style="fill: rgb(204, 0, 0);"></circle><circle cx="72" cy="18" r="2" transform="translate(100,100)" style="fill: rgb(204, 0, 0);"></circle><circle cx="240" cy="128" r="2" transform="translate(100,100)" style="fill: rgb(204, 0, 0);"></circle><circle cx="30" cy="124" r="2" transform="translate(100,100)" style="fill: rgb(204, 0, 0);"></circle><circle cx="99" cy="50" r="2" transform="translate(100,100)" style="fill: rgb(204, 0, 0);"></circle><circle cx="300" cy="185" r="2" transform="translate(100,100)" style="fill: rgb(204, 0, 0);"></circle></g></svg>`;

  // const grid = new GridHelper();
  // scene.add(grid);
  //
  // const axis = new AxesHelper();
  // axis.position.y = 1;
  // scene.add(axis);

  const group = new THREE.Group();

  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshStandardMaterial({ color: 0xdddddd });
  // const cube = new THREE.Mesh(geometry, material);
  // cube.position.y += 0.5;
  // group.add(cube);
  // scene.add(group);
  // group.scale.x = 0.05;
  // group.scale.y = 0.05;
  // group.scale.z = 0.05;
  // scene.add(cube);

  const svgGroup = new THREE.Group();
  const svgGroup2 = new THREE.Group();
  //
  const obj1 = renderSVG(svgGroup, 1, svgBar);
  scene.add(svgGroup);
  svgGroup.position.y += 1;
  svgGroup.rotation.x = Math.PI;
  // svgGroup.rotation.y = Math.PI;
  svgGroup.rotation.z = Math.PI * 2;
  svgGroup.position.z = -0.6;
  svgGroup.scale.x = 0.005;
  svgGroup.scale.y = 0.005;
  svgGroup.scale.z = 0.005;

  const obj2 = renderSVG(svgGroup2, 1, svgScatterSmall);
  scene.add(svgGroup2);
  svgGroup2.position.x -= 2;
  svgGroup2.position.y+= 1;
  svgGroup2.rotation.x = Math.PI;
  // svgGroup.rotation.y = Math.PI;
  svgGroup2.rotation.z = Math.PI * 2;
  // svgGroup2.position.z = -0.6;
  svgGroup2.scale.x = 0.005;
  svgGroup2.scale.y = 0.005;
  svgGroup2.scale.z = 0.005;


  // Add debug controls
  // const gui = new GUI();
  // const folder = gui.addFolder("Chart");
  // const rotationFolder = folder.addFolder("Rotation");
  // rotationFolder.add(svgGroup.rotation, "x", 0, Math.PI * 2);
  // rotationFolder.add(svgGroup.rotation, "y", 0, Math.PI * 2);
  // rotationFolder.add(svgGroup.rotation, "z", 0, Math.PI * 2);
  // const scaleFolder = folder.addFolder("Scale");
  // scaleFolder.add(svgGroup.scale, "x", 0, 0.001);
  // scaleFolder.add(svgGroup.scale, "y", 0, 0.001);
  // scaleFolder.add(svgGroup.scale, "z", 0, 0.001);
  // const positionFolder = folder.addFolder("Position");
  // positionFolder.add(svgGroup.position, "x", -1, 1);
  // positionFolder.add(svgGroup.position, "y", -1, 1);
  // positionFolder.add(svgGroup.position, "z", -1, 1);
  // folder.close();


  // const dragControls = GameObject.addNewComponent(group, DragControls);
  // dragControls.showGizmo = false;
  // dragControls.useViewAngle = false;

  const dragControls1 = GameObject.addNewComponent(svgGroup, DragControls);
  dragControls1.showGizmo = false;
  dragControls1.useViewAngle = false;

  const dragControls2 = GameObject.addNewComponent(svgGroup2, DragControls);
  dragControls2.showGizmo = false;
  dragControls2.useViewAngle = false;

  // GameObject.addComponent(svgGroup, new Rotate());
});
