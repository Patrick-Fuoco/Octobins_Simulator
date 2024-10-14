import React, { useState, useRef, useContext, useEffect } from "react";
import { AppContext } from "./AppContext";
import {
  Document,
  Page,
  Text,
  Image,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { createClient, OAuthStrategy } from "@wix/sdk";
import { products } from "@wix/stores";
import { currentCart } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import Cookies from "js-cookie";
import { default as Loader } from "./assets/spinner.svg";
import "./Interface.css";
import { Modal, Button } from "antd";
//import "antd/dist/antd.css";
const myWixClient = createClient({
  modules: { products, currentCart, redirects },
  auth: OAuthStrategy({
    clientId: `29b0e543-430c-496e-a4b4-9cdea1dadc2e`,
    tokens: JSON.parse(Cookies.get("session") || null),
  }),
});
let added = false;

export default function Interface() {
  const [activeIndex, setActiveIndex] = useState(0); // Initially set the first image as active
  const [state, setState] = useContext(AppContext);
  const [productList, setProductList] = useState([]);
  const [cart, setCart] = useState({});
  const [checkoutPressed, setCheckoutPressed] = useState(false);
  const [cloneColor, setCloneColor] = useState("#C43527"); // Default color for new clones

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };
  const handleImageClick = (index, e) => {
    setActiveIndex(index);
    setCloneColor(e.target.id);
    setState((prevState) => ({
      ...prevState,
      cloneColor: e.target.id, // Assuming this property is added to your global state
    }));
  };

  const images = [
    { image: "images/red-octogonal.png", id: "#C43527" },
    { image: "images/blue-octogonal.png", id: "#303B96" },
    { image: "images/green-octogonal.png", id: "#449648" },
    { image: "images/white-octogonal.png", id: "#F6F6F3" },
    { image: "images/yellow-octogonal.png", id: "#ECE80E" },
    { image: "images/black-octogonal.png", id: "#191919" },
    { image: "images/purple-octogonal.png", id: "#51087E" },
    { image: "images/pink-octogonal.png", id: "#FF007F" },
    { image: "images/grey-octogonal.png", id: "#898989" },
  ];

  const popupcontainer = useRef();

  // Ensure state and state.totalpieces are defined before accessing nested properties
  const totalpieces = state?.totalpieces || {};

  // Create styles
  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#E4E4E4",
      padding: 10,
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
    text: {
      fontSize: 25,
    },
    image: {
      width: "100%", // Set width to 100% to make it responsive
      height: "auto", // Automatically adjust height to maintain aspect ratio
    },
  });

  // Function to calculate total pieces

  // Create Document Component
  const MyDocument = () => {
    // console.log(state.canvas.toDataURL())

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.text}>Octogonal Bins</Text>
          <Image style={styles.image} src={state.canvas.toDataURL()} />
          <Text style={styles.text}>Total Pieces:</Text>
          {/* Display total pieces for each color if count > 0 */}
          {Object.entries(state.totalpieces).map(
            ([color, count]) =>
              count > 0 && (
                <Text
                  key={color}
                  style={styles.text}
                >{`${color}: ${count}`}</Text>
              )
          )}
          {/* Alternatively, you can display a single line for total pieces amount */}
          {/* <Text style={styles.text}>{`Total Pieces: ${calculateTotalPieces()}`}</Text> */}
        </Page>
      </Document>
    );
  };

  const generatePdf = async () => {
    setTimeout(async () => {
      const doc = <MyDocument />;
      const asPdf = pdf([]); // Create instance of PDF and pass an empty array
      asPdf.updateContainer(doc); // Add the document component to the PDF instance

      const blob = await asPdf.toBlob(); // Generate the PDF as a blob
      saveAs(blob, "Octogonal.pdf"); // Use file-saver to save the PDF
    }, 2000); // Delay of 2000 milliseconds (2 seconds)
  };

  const tutorialpopup = useRef();
  const sidebar = useRef();
  const bottomui = useRef();
  const Editbutton = useRef();
  const placeorderbtn = useRef();

  function Closepopup() {
    tutorialpopup.current.classList.add("close-tutorial-popup");
    // tutorialpopup.current.style.display ='none'
  }

  function HideUi() {
    setState((prevState) => ({ ...prevState, showedit: false }));
    sidebar.current.style.transform = "translate(100%,-50%)";
    bottomui.current.style.transform = "translate(-50%,150%)";

    setTimeout(() => {
      Editbutton.current.style.transform = "translate(-50%,-50%)";
    }, 600);
  }

  function ShowUi() {
    setTimeout(() => {
      setState((prevState) => ({ ...prevState, showedit: true }));
      sidebar.current.style.transform = "translate(0%,-50%)";
      bottomui.current.style.transform = "translate(-50%,-50%)";
    }, 600);

    Editbutton.current.style.transform = "translate(-50%,150%)";
  }

  function goToCart(totalpieces) {
    setCheckoutPressed(true); //starting loading icon for checkout button
    setState((prevState) => ({ ...prevState, totalpieces: totalpieces }));
    console.log("totalpieces", totalpieces);
    //await fetchProducts();
    //console.log("Here are products from goToCart()!", productList);
    let encodedObject = encodeURIComponent(JSON.stringify(totalpieces));
    const url =
      "https://www.octobins.shop/cart-page?appSectionParams=%7B%22origin%22%3A%22cart-icon%22%7D/?tings=" +
      encodedObject;
    window.location.href = url;
    //console.log("cartExport", cartExport);
  }

  function calculatePricing(bins) {
    const prices = [
      9.99, 16.99, 25.99, 29.99, 35.99, 40.99, 44.99, 47.99, 52.99, 55.99,
      59.99, 62.99, 66.99, 71.99, 74.99, 76.99, 81.99, 82.99, 84.99, 86.99,
      88.99, 90.99, 91.99, 92.99,
    ];
    const originalPrice = bins * 9.99;
    const discountedPrice = bins <= 24 ? prices[bins - 1] : prices[23];
    const savingsPercent = (
      ((originalPrice - discountedPrice) / originalPrice) *
      100
    ).toFixed(2);

    return { originalPrice, discountedPrice, savingsPercent };
  }
  function calculateTotalAndDiscount() {
    const prices = [
      9.99, 16.99, 25.99, 29.99, 35.99, 40.99, 44.99, 47.99, 52.99, 55.99,
      59.99, 62.99, 66.99, 71.99, 74.99, 76.99, 81.99, 82.99, 84.99, 86.99,
      88.99, 90.99, 91.99, 92.99,
    ];

    // Calculate the total number of bins from state
    const totalBins = Object.values(state.totalpieces).reduce(
      (acc, val) => acc + val,
      0
    );

    // Edge case to handle zero bins
    if (totalBins === 0) {
      return {
        totalCostBeforeDiscount: 0,
        totalCostAfterDiscount: 0,
        discountPercent: 0,
        savingsPercent: "0.00",
      };
    }

    // Calculate total cost based on prices array
    const totalCostBeforeDiscount =
      totalBins <= 24 ? prices[totalBins - 1] : prices[23];
    const originalTotalCost = totalBins * 9.99; // Original price without any discounts
    const savingsPercent = (
      ((originalTotalCost - totalCostBeforeDiscount) / originalTotalCost) *
      100
    ).toFixed(0);

    // No extra discounts applied beyond the rebate prices
    return {
      totalCostBeforeDiscount,
      totalCostAfterDiscount: totalCostBeforeDiscount, // No additional discount applied
      discountPercent: 0, // No extra discount percentage
      savingsPercent,
    };
  }

  // useEffect(()=>{
  //   setTimeout(() =>{
  //     tutorialpopup.current.style.display = 'block'

  //   },3000)
  // },[tutorialpopup])

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      placeorderbtn: placeorderbtn.current,
    }));
  }, [placeorderbtn]);

  return (
    <>
      {/* <PdfGenerator/> */}
      <div ref={popupcontainer} className="price-popup-container ">
        <div className="popup">
          <div className="pieces-container">
            {Object.entries(state.totalpieces).map(
              ([color, count]) =>
                count > 0 && (
                  <div key={color} className="octogonal-bin-container">
                    <img src={`images/${color}-octogonal.png`} />
                    <div className="pieces-details-container">
                      <p>
                        {count}x Pieces of{" "}
                        {color.charAt(0).toUpperCase() + color.slice(1)}{" "}
                        Octogonal Bin
                      </p>
                      <p className="price">
                        {calculatePricing(count).originalPrice}$ CAD
                      </p>
                    </div>
                  </div>
                )
            )}
            <h1 className="total-cost-text">
              Total Cost:{" "}
              {calculateTotalAndDiscount().totalCostBeforeDiscount.toFixed(2)}$
              CAD
            </h1>
            <div className="discount-notification">
              <p>
                🌟 Congrats! You unlocked a{" "}
                {calculateTotalAndDiscount().savingsPercent}% discount. Applied
                at checkout. 🌟
              </p>
            </div>
          </div>

          <button
            ref={placeorderbtn}
            className="place-order-button"
            onClick={() => goToCart(totalpieces)}
          >
            {checkoutPressed === true ? (
              <img src={Loader} className="spinner" />
            ) : (
              "Place Order"
            )}
          </button>

          <div
            className="close-popup-button"
            onClick={() =>
              popupcontainer.current.classList.remove(
                "show-price-popup-container"
              )
            }
          >
            <i className="bi bi-x"></i>
          </div>
        </div>
      </div>

      <div className="tutorial-popup" ref={tutorialpopup}>
        <video controls autoPlay>
          <source src="tutorial.mp4" type="video/mp4" />
        </video>

        <div
          className="tutorial-popup-delete-button"
          onClick={() => Closepopup()}
        >
          <i class="bi bi-x"></i>
        </div>
      </div>
      <button className="go-back-button">
        <a href="https://www.octobins.shop/">Return to site</a>
      </button>
      <div ref={bottomui} className="Bottom-ui">
        <button
          className="Cart-button"
          onClick={() =>
            popupcontainer.current.classList.add("show-price-popup-container")
          }
        >
          <i className="bi bi-bag"></i>Cart
        </button>

        <button onClick={() => HideUi()}>Preview</button>
        <button type="primary" onClick={showModal}>
          Help
        </button>
        <Modal
          title="Welcome to the simulator!"
          visible={isModalVisible}
          onCancel={handleClose}
          footer={null} // Consider setting to null if no footer is needed
          centered
          style={{ fontSize: "30" }}
        >
          <p>Here's how it works:</p>
          <ol>
            <li>
              Click the '+' buttons to add octobins to your layout (maximum 24
              allowed).
            </li>
            <li> Click on an octobin to change colour or delete.</li>
            <li>
              Click the checkout button to have all your octobins automatically
              added to cart.
            </li>
            <li>
              Enjoy increasing discounts with every additional octobin you add!
            </li>
          </ol>
        </Modal>
      </div>

      <button ref={Editbutton} className="Edit-button" onClick={() => ShowUi()}>
        Edit
      </button>

      <div ref={sidebar} className="sidebar">
        {images.map((src, index) => (
          <div
            id={src.id}
            key={index}
            onClick={(e) => handleImageClick(index, e)}
            className={index === activeIndex ? "active-material" : ""}
            style={{ background: src.id }}
          >
            <i
              style={{ opacity: index === activeIndex ? 1 : 0 }}
              class="bi bi-check"
            ></i>
            {/* <img src={src.image} alt={`octagonal-bin-${index}`} /> */}
          </div>
        ))}
      </div>
    </>
  );
}
// async function fetchProducts() {
//   const productList = await myWixClient.products.queryProducts().find();
//   console.log("typeof(productList)", typeof productList);
//   if (typeof productList !== "undefined") {
//     setProductList(productList.items);
//     console.log("Product List", productList);
//   }
//   appToWixMap(productList._items);
//   return productList;
// }
// function appToWixMap(productList) {
//   let lineItems = [];
//   let temp = null;
//   let single_units = [];
//   console.log("product list", productList.slug);
//   for (let i = 0; i < productList.length; i++) {
//     if (productList[i].slug.toString().includes("single")) {
//       single_units.push(productList[i]);
//     }
//   }

//   let keys = Object.keys(totalpieces);
//   console.log("totalpieces", totalpieces);
//   for (let j = 0; j < keys.length; j++) {
//     let color = keys[j].toString();
//     if (Number(totalpieces[color]) > 0) {
//       console.log("color", totalpieces[color]);
//       for (let k = 0; k < single_units.length; k++) {
//         let sluggo = single_units[k].slug.toString().toLowerCase().split("-");
//         if (sluggo.includes(color.toString().toLowerCase())) {
//           const options = single_units[k].productOptions.reduce(
//             (selected, option) => ({
//               ...selected,
//               [option.name]: option.choices[0].description,
//             }),
//             {}
//           );
//           const temp = {
//             catalogReference: {
//               appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e", //THIS PROBABLY NEEDS TO BE CHANGED
//               catalogItemId: single_units[k]._id,
//               options: { options },
//             },
//             quantity: totalpieces[color],
//           };

//           lineItems.push(temp);
//         }
//       }
//     }
//   }

//   addToCart(lineItems);
//   console.log("lineItems", lineItems);
// }
// async function createRedirect() {
//   const { checkoutId } =
//     await myWixClient.currentCart.createCheckoutFromCurrentCart({
//       channelType: currentCart.ChannelType.WEB,
//     });
//   const redirect = await myWixClient.redirects.createRedirectSession({
//     ecomCheckout: { checkoutId },
//     callbacks: { postFlowUrl: window.location.href },
//   });
//   window.location = redirect.redirectSession.fullUrl;
// }
// async function addToCart(lineItems) {
//   if (added === false) {
//     const { cart } = await myWixClient.currentCart.addToCurrentCart({
//       lineItems,
//     });
//     setCart(cart);
//     console.log("cart", cart);
//     added = true;
//     console.log("Heres cart again", cart);
//     //createRedirect();
//     let encodedObject = encodeURIComponent(JSON.stringify(cart));
//     const url = "https://www.octobins.shop/cart-page?appSectionParams=%7B%22origin%22%3A%22cart-icon%22%7D/?tings=" + encodedObject;
//     console.log("url",url);
//     window.location.href = url;
//   }
// }

// function goToCheckout(totalpieces) {
//   setCheckoutPressed(true); //starting loading icon for checkout button
//   setState((prevState) => ({ ...prevState, totalpieces: totalpieces }));
//   fetchProducts();
//   console.log("Here are products!", productList);
// }

{
  /* {totalpieces.red ? (
              <div className="octogonal-bin-container">
                <img src="images/red-octogonal.png" />
                <div className="pieces-details-container">
                  <p>{totalpieces.red}x Pieces of Red Octogonal Bin</p>
                  <p className="price">{totalpieces.red * 6}$</p>
                </div>
              </div>
            ) : null}

            {totalpieces.blue ? (
              <div className="octogonal-bin-container">
                <img src="images/blue-octogonal.png" />
                <div className="pieces-details-container">
                  <p>{totalpieces.blue}x Pieces of Blue Octogonal Bin</p>
                  <p className="price">{totalpieces.blue * 6}$</p>
                </div>
              </div>
            ) : null}

            {totalpieces.white ? (
              <div className="octogonal-bin-container">
                <img src="images/white-octogonal.png" />
                <div className="pieces-details-container">
                  <p>{totalpieces.white}x Pieces of White Octogonal Bin</p>
                  <p className="price">{totalpieces.white * 6}$</p>
                </div>
              </div>
            ) : null}

            {totalpieces.green ? (
              <div className="octogonal-bin-container">
                <img src="images/green-octogonal.png" />
                <div className="pieces-details-container">
                  <p>{totalpieces.green}x Pieces of Green Octogonal Bin</p>
                  <p className="price">{totalpieces.green * 6}$</p>
                </div>
              </div>
            ) : null}

            {totalpieces.yellow ? (
              <div className="octogonal-bin-container">
                <img src="images/yellow-octogonal.png" />
                <div className="pieces-details-container">
                  <p>{totalpieces.yellow}x Pieces of Yellow Octogonal Bin</p>
                  <p className="price">{totalpieces.yellow * 6}$</p>
                </div>
              </div>
            ) : null}

            {totalpieces.purple ? (
              <div className="octogonal-bin-container">
                <img src="images/purple-octogonal.png" />
                <div className="pieces-details-container">
                  <p>{totalpieces.purple}x Pieces of Purple Octogonal Bin</p>
                  <p className="price">{totalpieces.purple * 6}$</p>
                </div>
              </div>
            ) : null}

            {totalpieces.black ? (
              <div className="octogonal-bin-container">
                <img src="images/black-octogonal.png" />
                <div className="pieces-details-container">
                  <p>{totalpieces.black}x Pieces of Black Octogonal Bin</p>
                  <p className="price">{totalpieces.black * 6}$</p>
                </div>
              </div>
            ) : null}

            {totalpieces.pink ? (
              <div className="octogonal-bin-container">
                <img src="images/pink-octogonal.png" />
                <div className="pieces-details-container">
                  <p>{totalpieces.pink}x Pieces of Pink Octogonal Bin</p>
                  <p className="price">{totalpieces.pink * 6}$</p>
                </div>
              </div>
            ) : null}

            {totalpieces.grey ? (
              <div className="octogonal-bin-container">
                <img src="images/grey-octogonal.png" />
                <div className="pieces-details-container">
                  <p>{totalpieces.grey}x Pieces of Grey Octogonal Bin</p>
                  <p className="price">{totalpieces.grey * 6}$</p>
                </div>
              </div>
            ) : null} */
}
