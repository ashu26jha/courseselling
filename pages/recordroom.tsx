import React from "react";
import { HuddleIframe, iframeApi, useEventListner } from "@huddle01/iframe";
import Dropzone from "../components/DropZone"

const recordRoom = () => {
    useEventListner("lobby:initialized", () => {
        iframeApi.initialize({
            wallets: ["metamask"],
        });
    });
    
    return (
        <div>
            <div className="flex">
                <HuddleIframe roomUrl="https://iframe.huddle01.com/" className="w-3/4 h-half aspect-video" /><div><button>DW</button></div>
            </div>
            <Dropzone className='p-16 mt-10 ml-40 mr-40 w-3/4 border border-neutral-200' />

        </div>
    )
};
export default recordRoom;
