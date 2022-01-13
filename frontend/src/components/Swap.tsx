import React from "react";
import useForm from "../hooks/swapHook";
import {FaSearch} from "react-icons/fa";

// const BN = require("bn.js");

function Swap(walletKey: any, placeHolder: string) {
  const signup = () => {
    console.log("hi");
  };

  const {inputs, handleInputChange, handleSubmit} = useForm(signup);

  return (
    <div>
      <form id="form" onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex flex-col border-4">
          <div className="flex flex-row justify-between text-xs">
            <p>from</p>
            <p>balance: {"value"}</p>
          </div>
          <div className="flex flex-row justify-between">
            <input
              type=""
              name="input-amount"
              placeholder="placeholder"
              onChange={handleInputChange}
              /* value={inputs.search} */
            />
            <p>token: {"name"}</p>
          </div>
        </div>
        <div className="flex flex-col border-4">
          <div className="flex flex-row justify-between text-xs">
            <p>to</p>
            {/* <p>balance: {"value"}</p> */}
          </div>
          <div className="flex flex-row justify-between">
            <input
              type=""
              name="output-amount"
              placeholder="placeholder"
              /* value={inputs.search} */
            />
            <p>token: {"name"}</p>
          </div>
        </div>

        <button type="submit" className="border">
          <p>Swap</p>
        </button>
      </form>
    </div>
  );
}

export default Swap;
