//FYI THIS COMPONENT WAS ONLY USED AS A TEST BENCH. iT HAS BEEN REMOVED FROM ALL IMPORTS AND SIMPLY REMAINS FOR LEGACY CODE(SORRY, IK IT'S BAD PRACTICE)
import { createClient, OAuthStrategy } from "@wix/sdk";
//import { NextResponse } from "/next/server";

import { products } from "@wix/stores";
import { currentCart } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import { useEffect, useState, useContext } from "react";
import Cookies from "js-cookie";
import { AppContext } from "./AppContext";

const myWixClient = createClient({
  modules: { products, currentCart, redirects },
  auth: OAuthStrategy({
    clientId: `29b0e543-430c-496e-a4b4-9cdea1dadc2e`,
    tokens: JSON.parse(Cookies.get("session") || null),
  }),
});
let added = false;
export default function Store() {
  const [state, setState] = useContext(AppContext);
  const totalpieces = state?.totalpieces || {};
  const [productList, setProductList] = useState([]);
  const [cart, setCart] = useState({});

  
  async function fetchProducts() {
    const productList = await myWixClient.products.queryProducts().find();
    console.log("typeof(productList)",typeof(productList));
    if(typeof(productList) !== "undefined"){
    setProductList(productList.items);
    console.log("Product List", productList);
    }
    appToWixMap(productList._items);
    return productList;
  }

  async function fetchCart() {
    try {
      setCart(await myWixClient.currentCart.getCurrentCart());
    } catch {
      //setCart(await myWixClient.createCart());
    }
  }
  function appToWixMap(productList) {
    let lineItems = [];
    let temp = null;
    let single_units = [];
    //console.log("product list",productList.slug);
    for(let i = 0; i < productList.length; i++) 
      {
        //console.log("slug",productList[i].slug);
        if(productList[i].slug.toString().includes("single"))
        {
          single_units.push(productList[i]);
        }
      }

    let keys = Object.keys(totalpieces);
    console.log("totalpieces",totalpieces)
    for(let j = 0; j < keys.length; j++)
    {
      let color = keys[j].toString();
      if(Number(totalpieces[color]) > 0)
      {
        console.log("color", totalpieces[color]);
        for(let k = 0; k < single_units.length;k++)
        {
          //console.log ("unit",single_units[k]);
          let sluggo = single_units[k].slug.toString().toLowerCase().split('-');
          //console.log("sluggo",sluggo)
          if (sluggo.includes(color.toString().toLowerCase()))
          {
            //console.log("in the if!");
            //const temp = {};
            const options = single_units[k].productOptions.reduce(
              (selected, option) => ({
                ...selected,
                [option.name]: option.choices[0].description,
              }),
              {},
            );
            const temp = {
              catalogReference: {
                appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",//THIS PROBABLY NEEDS TO BE CHANGED
                catalogItemId: single_units[k]._id,
                options: { options },
              },
              quantity: totalpieces[color],
            };
            // temp.catalogReference.appId = "1380b703-ce81-ff05-f115-39571d94dfcd";
            // temp.catalogReference.catalogItemId = single_units[k]._id;
            // temp.catalogReference.options = {options};
            // temp.quantity = totalpieces[color];

            //temp = single_units[k];
            lineItems.push(temp);
            // addToCart(single_units[k]);
          }
        }
    }
    }
    //clearCart();

    addToCart(lineItems);
    //console.log("single_units", single_units);

  }
  async function addToCart(lineItems) {
    if (added === false){
      const { cart } = await myWixClient.currentCart.addToCurrentCart({lineItems});
      //setState(cart => [...cart,cart] );
      //setState((prevState) => ({ ...prevState, cart: cart }));
      setCart(cart);
      console.log("cart", cart)
      //console.log("auth",myWixClient.currentCart.createCheckoutFromCurrentCart())
      added = true;
    }

  }

  async function clearCart() {
    await myWixClient.currentCart.deleteCurrentCart();
    setCart({});
  }

  async function createRedirect() {
    const { checkoutId } =
      await myWixClient.currentCart.createCheckoutFromCurrentCart({
        channelType:currentCart.ChannelType.WEB,
      });
    const redirect = await myWixClient.redirects.createRedirectSession({
      ecomCheckout: { checkoutId },
      callbacks: { postFlowUrl: window.location.href },
    });
    window.location = redirect.redirectSession.fullUrl;
  }

  useEffect(() => {
    fetchCart();
    fetchProducts();
    //appToWixMap();
    // setState((prevState) => ({ ...prevState, cart: cart }));
  }, []);
  useEffect(() => {
    //fetchProducts();
    //fetchCart();
    // appToWixMap();
  }, []);

  return (
    <div>
      <div>

      </div>
      <div>
        <div>
        <h2>Cart:</h2>
        </div>
        {cart.lineItems?.length > 0 && (
          <>
            <div onClick={() => createRedirect()}>
              <h3>
                {cart.lineItems.length} items ({cart.subtotal.formattedAmount})
              </h3>
              <span>Checkout</span>
            </div>
            <div onClick={() => clearCart()}>
              <span>Clear cart</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
