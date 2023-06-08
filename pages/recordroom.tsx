import React from "react";
import { HuddleIframe, iframeApi, useEventListner } from "@huddle01/iframe";
import Dropzone from "../components/DropZone"
import lighthouse from '@lighthouse-web3/sdk'


const recordRoom = () => {
    useEventListner("lobby:initialized", () => {
        iframeApi.initialize({
            wallets: ["metamask"],
        });
    });
    async function Test() {
        console.log( await lighthouse.getUploads('0xB1320b6c0104ed34d2570D9D19A83046Fe5D39B2'));
    }

    
    return (
        <div>
            <div className="flex">
                <HuddleIframe roomUrl="https://iframe.huddle01.com/" className="w-3/4 h-half aspect-video" /><div><button>DW</button></div>
            </div>
            <Dropzone className='p-16 mt-10 ml-40 mr-40 w-3/4 border border-neutral-200' />
            <button onClick={Test}>Click Me</button>
        </div>
    )
};
export default recordRoom;
