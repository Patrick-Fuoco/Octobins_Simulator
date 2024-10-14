import { Clone, Html, useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useState, useContext, useRef } from "react";
import * as THREE from "three";
import { AppContext } from "./AppContext";
import gsap from "gsap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./Octogonal.css"; // Import the CSS file

const MySwal = withReactContent(Swal);

export default function Octogonal() {
  const { nodes } = useGLTF("model.glb");
  const [clones, setClones] = useState([]);
  const [state, setState] = useContext(AppContext);
  const [showPrimitiveButtons, setShowPrimitiveButtons] = useState(true); // State for primitive bin buttons
  const [forceUpdate, setForceUpdate] = useState(false); // State to force re-render
  const { scene, camera } = useThree();
  const [primitiveColor, setPrimitiveColor] = useState("#C43527");

  const colors = [
    { image: "images/blue-octogonal.png", id: "#303B96" },
    { image: "images/red-octogonal.png", id: "#C43527" },
    { image: "images/green-octogonal.png", id: "#449648" },
    { image: "images/white-octogonal.png", id: "#F6F6F3" },
    { image: "images/yellow-octogonal.png", id: "#ECE80E" },
    { image: "images/black-octogonal.png", id: "#191919" },
    { image: "images/purple-octogonal.png", id: "#51087E" },
    { image: "images/pink-octogonal.png", id: "#FF007F" },
    { image: "images/grey-octogonal.png", id: "#898989" },
  ];

  const calculatePosition = (direction, original) => {
    const offset = 0.96; // Distance from center to vertex if bins touch at vertices
    const diagonalOffset = Math.sqrt(2 * (offset * offset)); // Distance between diagonal points
    switch (direction) {
      case "top":
        return new THREE.Vector3(
          original.position.x,
          original.position.y + offset,
          original.position.z
        );
      case "bottom":
        return new THREE.Vector3(
          original.position.x,
          original.position.y - offset,
          original.position.z
        );
      case "left":
        return new THREE.Vector3(
          original.position.x + offset,
          original.position.y,
          original.position.z
        );
      case "right":
        return new THREE.Vector3(
          original.position.x - offset,
          original.position.y,
          original.position.z
        );
      case "top-left":
        return new THREE.Vector3(
          original.position.x - diagonalOffset / 2,
          original.position.y + diagonalOffset / 2,
          original.position.z
        );
      case "top-right":
        return new THREE.Vector3(
          original.position.x + diagonalOffset / 2,
          original.position.y + diagonalOffset / 2,
          original.position.z
        );
      case "bottom-left":
        return new THREE.Vector3(
          original.position.x - diagonalOffset / 2,
          original.position.y - diagonalOffset / 2,
          original.position.z
        );
      case "bottom-right":
        return new THREE.Vector3(
          original.position.x + diagonalOffset / 2,
          original.position.y - diagonalOffset / 2,
          original.position.z
        );
      default:
        return null;
    }
  };

  const getColorKeyFromId = (colorId) => {
    const colorMap = {
      "#C43527": "red",
      "#303B96": "blue",
      "#449648": "green",
      "#F6F6F3": "white",
      "#ECE80E": "yellow",
      "#191919": "black",
      "#51087E": "purple",
      "#FF007F": "pink",
      "#898989": "grey",
    };
    return colorMap[colorId] || null;
  };
  const isTooClose = (newPos) => {
    const minDistance = 0.9; // Adjust this distance as needed
    return (
      clones.some((clone) => clone.position.distanceTo(newPos) < minDistance) ||
      scene.getObjectByName("name0").position.distanceTo(newPos) < minDistance
    );
  };

  const handleClone = (direction, name) => {
    const original = scene.getObjectByName(name);
    if (!original) {
      return;
    }

    let newPos = calculatePosition(direction, original);
    if (isTooClose(newPos)) {
      alert("Cannot place a bin here. Too close to an existing bin.");
      return;
    }

    // Use cloneColor from the context
    const newCloneColor = state.cloneColor || "#C43527"; // Default color if not set

    const newClone = {
      position: newPos,
      rotationx: original.rotation.x + Math.PI / 4, // Assuming simple rotation adjustment
      name: `name${Date.now()}`,
      mycolor: newCloneColor, // Use the selected color
      bool: original.bool, // Assuming you're toggling some boolean value
    };

    setClones((prevClones) => [...prevClones, newClone]);
    const colorKey = getColorKeyFromId(newClone.mycolor);
    if (colorKey) {
      setState((prevState) => ({
        ...prevState,
        totalpieces: {
          ...prevState.totalpieces,
          [colorKey]: (prevState.totalpieces[colorKey] || 0) + 1,
        },
      }));
    }

    setForceUpdate((prev) => !prev); // Use force update to trigger re-render

    // Reinclude your existing setTimeout to update plus buttons
    setTimeout(() => updatePlusButtons(), 10);
    updatePlusButtonsOnPrimitiveBin(); // Adjusted to only update the primitive bin
  };

  const updatePlusButtonsOnPrimitiveBin = () => {
    // Update the visibility of '+' buttons on the primitive bin based on the new state of the scene
    const positions = [
      "top",
      "bottom",
      "left",
      "right",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ];
    positions.forEach((position) => {
      // Check if there's room to place a new bin at each position
      const button = document.getElementById(`plus-${position}-name0`);
      if (button) {
        if (isValidPosition(position, "name0")) {
          button.style.display = "block";
        } else {
          button.style.display = "none";
        }
      }
    });
  };

  const updatePlusButtons = () => {
    // Trigger any needed state changes or callbacks to update UI
    setState((prevState) => ({ ...prevState })); // Dummy update for re-render
  };

  const logInvalidPositions = () => {
    const positions = [
      "top",
      "bottom",
      "left",
      "right",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ];
    clones.forEach((clone) => {
      positions.forEach((position) => {
        if (!isValidPosition(position, clone.name)) {
        }
      });
    });
  };
  // Additional functions such as handleDelete, handleColorChange, showPopup

  useEffect(() => {
    // Ensure '+' buttons are properly managed whenever clones update
    updatePlusButtons();
    updatePlusButtonsOnPrimitiveBin();
    logInvalidPositions(); // Ensure primitive bin is updated
  }, [clones]);

  const handleDelete = (name) => {
    const remainingClones = clones.filter((clone) => clone.name !== name);
    setClones(remainingClones);

    if (remainingClones.length < clones.length) {
      // Find the clone that is going to be deleted
      const deletedClone = clones.find((clone) => clone.name === name);
      if (deletedClone) {
        const colorKey = getColorKeyFromId(deletedClone.mycolor);
        if (colorKey && state.totalpieces[colorKey] > 0) {
          // Decrement the count for this specific color
          setState((prevState) => ({
            ...prevState,
            totalpieces: {
              ...prevState.totalpieces,
              [colorKey]: prevState.totalpieces[colorKey] - 1,
            },
          }));
        }
      }
    }
  };

  const handleColorChange = (name, newColor) => {
    // Update the color for the primitive bin or clones
    if (name === "name0") {
      // Only update the primitive bin's color and cart entry
      const oldColorKey = getColorKeyFromId(state.themeColor); // Get the current color key of the primitive bin
      const newColorKey = getColorKeyFromId(newColor); // Get the new color key
      if (oldColorKey && newColorKey && oldColorKey !== newColorKey) {
        // Update the cart and the color of the primitive bin
        setState((prevState) => ({
          ...prevState,
          themeColor: newColor, // Update the color of the primitive bin
          totalpieces: {
            ...prevState.totalpieces,
            [oldColorKey]:
              prevState.totalpieces[oldColorKey] > 0
                ? prevState.totalpieces[oldColorKey] - 1
                : 0,
            [newColorKey]: (prevState.totalpieces[newColorKey] || 0) + 1,
          },
        }));
      }
    } else {
      // Handle color changes for clones
      setClones((prevClones) =>
        prevClones.map((clone) => {
          if (clone.name === name) {
            const oldColorKey = getColorKeyFromId(clone.mycolor);
            const newColorKey = getColorKeyFromId(newColor);
            if (oldColorKey && newColorKey && oldColorKey !== newColorKey) {
              // Update cart for the clones
              setState((prevState) => ({
                ...prevState,
                totalpieces: {
                  ...prevState.totalpieces,
                  [oldColorKey]:
                    prevState.totalpieces[oldColorKey] > 0
                      ? prevState.totalpieces[oldColorKey] - 1
                      : 0,
                  [newColorKey]: (prevState.totalpieces[newColorKey] || 0) + 1,
                },
              }));
            }
            return { ...clone, mycolor: newColor };
          }
          return clone;
        })
      );
    }
  };

  const showPopup = (name) => {
    MySwal.fire({
      title: "Manage Bin",
      html: (
        <div>
          <button
            onClick={() => {
              handleDelete(name);
              MySwal.close();
            }}
          >
            Delete
          </button>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {colors.map((color) => (
              <img
                key={color.id}
                src={color.image}
                alt={color.id}
                style={{ width: "50px", height: "50px", cursor: "pointer" }}
                onClick={() => {
                  handleColorChange(name, color.id);
                  MySwal.close();
                }}
              />
            ))}
          </div>
        </div>
      ),
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  const handleBinClick = (name) => {
    showPopup(name);
  };

  const clonematerial = useRef();

  useEffect(() => {
    if (clonematerial.current) {
      clonematerial.current.needsUpdate = true;
      gsap.to(clonematerial.current, {
        opacity: 1,
        duration: 1.3,
        ease: "power3.out",
      });
    }
  }, [clones]);

  useEffect(() => {
    const handlePlaceOrderClick = () => {
      gsap.to(camera.position, {
        x: -3,
        y: 2,
        z: 5,
        duration: 1,
        ease: "power3.out",
      });
    };

    state.placeorderbtn.addEventListener("click", handlePlaceOrderClick);

    return () => {
      state.placeorderbtn.removeEventListener("click", handlePlaceOrderClick);
    };
  }, [camera, state.placeorderbtn]);

  const isValidPosition = (direction, name) => {
    const original = scene.getObjectByName(name);
    if (!original) return false;
    let newPos = calculatePosition(direction, original);
    return !isTooClose(newPos);
  };

  return (
    <>
      {/* Original bin */}
      <primitive
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "default")}
        name="name0"
        receiveShadow
        castShadow
        object={nodes["octogonal-bin"]}
        onClick={() => handleBinClick("name0")}
      >
        <meshStandardMaterial
          color={state.themeColor}
          roughness={0.75}
          metalness={0.05}
        />

        {state.showedit && showPrimitiveButtons && (
          <>
            <Html
              zIndexRange={5}
              occlude
              rotation={[Math.PI * 0.5, 0, 0]}
              position={[0, 40, -50]}
              scale={8}
              transform
            >
              <i
                //ref={primitive_top}
                id="plus-top-name0"
                onClick={(element) => handleClone("top", "name0", element)}
                className="bi bi-plus-circle-fill"
                style={{ display: "block" }}
              ></i>
            </Html>
            <Html
              zIndexRange={5}
              occlude
              rotation={[Math.PI * 0.5, 0, 0]}
              position={[0, 40, 48]}
              scale={8}
              transform
            >
              <i
                id="plus-bottom-name0"
                //ref={primitive_bottom}
                onClick={(element) => handleClone("bottom", "name0", element)}
                className="bi bi-plus-circle-fill"
                style={{ display: "block" }}
              ></i>
            </Html>
            <Html
              zIndexRange={5}
              occlude
              rotation={[Math.PI * 0.5, 0, 0]}
              position={[50, 40, 0]}
              scale={8}
              transform
            >
              <i
                id="plus-left-name0"
                //ref={primitive_left}
                onClick={(element) => handleClone("left", "name0", element)}
                className="bi bi-plus-circle-fill"
                style={{ display: "block" }}
              ></i>
            </Html>
            <Html
              zIndexRange={5}
              occlude
              rotation={[Math.PI * 0.5, 0, 0]}
              position={[-50, 40, 0]}
              scale={8}
              transform
            >
              <i
                // ref={primitive_right}
                id="plus-right-name0"
                onClick={(element) => handleClone("right", "name0", element)}
                className="bi bi-plus-circle-fill"
                style={{ display: "block" }}
              ></i>
            </Html>
            {/* Diagonal buttons */}
            <Html
              zIndexRange={5}
              occlude
              rotation={[Math.PI * 0.5, 0, 0]}
              position={[-35, 40, -35]}
              scale={8}
              transform
            >
              <i
                // ref={primitive_top_left}
                id="plus-top-left-name0"
                onClick={(element) => handleClone("top-left", "name0", element)}
                className="bi bi-plus-circle-fill"
                style={{ display: "block" }}
              ></i>
            </Html>
            <Html
              zIndexRange={5}
              occlude
              rotation={[Math.PI * 0.5, 0, 0]}
              position={[35, 40, -35]}
              scale={8}
              transform
            >
              <i
                // ref={primitive_top_right}
                id="plus-top-right-name0"
                onClick={(element) =>
                  handleClone("top-right", "name0", element)
                }
                className="bi bi-plus-circle-fill"
                style={{ display: "block" }}
              ></i>
            </Html>
            <Html
              zIndexRange={5}
              occlude
              rotation={[Math.PI * 0.5, 0, 0]}
              position={[-35, 40, 35]}
              scale={8}
              transform
            >
              <i
                // ref={primitive_bottom_left}
                id="plus-bottom-left-name0"
                onClick={(element) =>
                  handleClone("bottom-left", "name0", element)
                }
                className="bi bi-plus-circle-fill"
                style={{ display: "block" }}
              ></i>
            </Html>
            <Html
              zIndexRange={5}
              occlude
              rotation={[Math.PI * 0.5, 0, 0]}
              position={[35, 40, 35]}
              scale={8}
              transform
            >
              <i
                id="plus-bottom-right-name0"
                onClick={(element) =>
                  handleClone("bottom-right", "name0", element)
                }
                className="bi bi-plus-circle-fill"
                style={{ display: "block" }}
              ></i>
            </Html>

            <Html
              rotation={[Math.PI * 0.5, 0, Math.PI]}
              position={[0, 54, -2]}
              zIndexRange={5}
              occlude
              scale={8}
              transform
            >
              <i
                // className="bin-delete-button bi bi-trash-fill"
                onClick={() => handleDelete("name0")}
              ></i>
            </Html>
          </>
        )}
      </primitive>

      {/* Render clones */}
      {clones.map((clone, index) => (
        <group key={clone.name}>
          {state.showedit && (
            <>
              {isValidPosition("top", clone.name) && (
                <Html
                  key={"top" + clone.name}
                  zIndexRange={5}
                  occlude
                  rotation={[0, 0, 0]}
                  position={[clone.position.x, clone.position.y + 0.6, 0.5]}
                  scale={0.105}
                  transform
                >
                  <i
                    onClick={(element) =>
                      handleClone("top", clone.name, element)
                    }
                    className="bi bi-plus-circle-fill"
                  ></i>
                </Html>
              )}
              {isValidPosition("bottom", clone.name) && (
                <Html
                  key={"bottom" + clone.name}
                  zIndexRange={5}
                  occlude
                  rotation={[0, 0, 0]}
                  position={[
                    clone.position.x,
                    clone.position.y - 0.6,
                    clone.position.z + 0.5,
                  ]}
                  scale={0.105}
                  transform
                >
                  <i
                    onClick={(element) =>
                      handleClone("bottom", clone.name, element)
                    }
                    className="bi bi-plus-circle-fill"
                  ></i>
                </Html>
              )}
              {isValidPosition("left", clone.name) && (
                <Html
                  key={"left" + clone.name}
                  zIndexRange={5}
                  occlude
                  rotation={[0, 0, 0]}
                  position={[
                    clone.position.x + 0.65,
                    clone.position.y,
                    clone.position.z + 0.5,
                  ]}
                  scale={0.105}
                  transform
                >
                  <i
                    onClick={(element) =>
                      handleClone("left", clone.name, element)
                    }
                    className="bi bi-plus-circle-fill"
                  ></i>
                </Html>
              )}
              {isValidPosition("right", clone.name) && (
                <Html
                  key={"right" + clone.name}
                  zIndexRange={5}
                  occlude
                  rotation={[0, 0, 0]}
                  position={[
                    clone.position.x - 0.65,
                    clone.position.y,
                    clone.position.z + 0.5,
                  ]}
                  scale={0.105}
                  transform
                >
                  <i
                    onClick={(element) =>
                      handleClone("right", clone.name, element)
                    }
                    className="bi bi-plus-circle-fill"
                  ></i>
                </Html>
              )}
              {isValidPosition("top-right", clone.name) && (
                <Html
                  key={"top-right" + clone.name}
                  zIndexRange={5}
                  occlude
                  rotation={[0, 0, 0]}
                  position={[
                    clone.position.x + 0.45,
                    clone.position.y + 0.45,
                    clone.position.z + 0.5,
                  ]}
                  scale={0.105}
                  transform
                >
                  <i
                    onClick={(element) =>
                      handleClone("top-right", clone.name, element)
                    }
                    className="bi bi-plus-circle-fill"
                  ></i>
                </Html>
              )}
              {isValidPosition("top-left", clone.name) && (
                <Html
                  key={"top-left" + clone.name}
                  zIndexRange={5}
                  occlude
                  rotation={[0, 0, 0]}
                  position={[
                    clone.position.x - 0.45,
                    clone.position.y + 0.45,
                    clone.position.z + 0.5,
                  ]}
                  scale={0.105}
                  transform
                >
                  <i
                    onClick={(element) =>
                      handleClone("top-left", clone.name, element)
                    }
                    className="bi bi-plus-circle-fill"
                  ></i>
                </Html>
              )}
              {isValidPosition("bottom-right", clone.name) && (
                <Html
                  key={"bottom-right" + clone.name}
                  zIndexRange={5}
                  occlude
                  rotation={[0, 0, 0]}
                  position={[
                    clone.position.x + 0.45,
                    clone.position.y - 0.45,
                    clone.position.z + 0.5,
                  ]}
                  scale={0.105}
                  transform
                >
                  <i
                    onClick={(element) =>
                      handleClone("bottom-right", clone.name, element)
                    }
                    className="bi bi-plus-circle-fill"
                  ></i>
                </Html>
              )}
              {isValidPosition("bottom-left", clone.name) && (
                <Html
                  key={"bottom-left" + clone.name}
                  zIndexRange={5}
                  occlude
                  rotation={[0, 0, 0]}
                  position={[
                    clone.position.x - 0.45,
                    clone.position.y - 0.45,
                    clone.position.z + 0.5,
                  ]}
                  scale={0.105}
                  transform
                >
                  <i
                    onClick={(element) =>
                      handleClone("bottom-left", clone.name, element)
                    }
                    className="bi bi-plus-circle-fill"
                  ></i>
                </Html>
              )}
            </>
          )}

          <Clone
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "default")}
            onClick={() => handleBinClick(clone.name)}
            name={clone.name}
            receiveShadow
            castShadow
            object={nodes["octogonal-bin"]}
            position={clone.position}
            rotation-y={clone.rotationx}
          >
            <meshPhysicalMaterial
              ref={clonematerial}
              transparent
              opacity={0}
              color={clone.mycolor}
              roughness={0.75}
              metalness={0.05}
            />
          </Clone>
        </group>
      ))}
    </>
  );
}
