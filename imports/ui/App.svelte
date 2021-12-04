<script type="text/javascript">

import { onMount } from 'svelte';
import { Tracker } from 'meteor/tracker';
import { useTracker } from 'meteor/rdb:svelte-meteor-data';
import { UsersCursorsStream } from "/imports/api/streams/user_cursors_stream";

let cursorsContainer;
const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

UsersCursorsStream.on('disconnected', function(subscriptionId) {
  // delete mouse
  console.log('disconnected', subscriptionId);
  deleteCursor(subscriptionId);
});

//listen on UsersCursorsStream on the message event
UsersCursorsStream.on('updateCursor', function(message) {
  const cursor = getCursorOrCreate(this.subscriptionId);
  // move mouse
  // console.log('updateCursor', message.x, message.y , this.subscriptionId);
  const mouseX = message.x * window.innerWidth;
  const mouseY = message.y * window.innerHeight;

  // console.log("window.innerWidth", window.innerWidth, window.innerHeight);

  console.log("mouseX", mouseX, mouseY);

  cursor.style.transform = `translateX(${mouseX}px) translateY(${mouseY}px)`;
  // cursor.style.left = mouseX+'px';
  // cursor.style.top = mouseY+'px';
  cursor.style.opacity = "1";

});

UsersCursorsStream.on('hideCursor', function(message) {
  hideCursor(this.subscriptionId);
});

function getCursorOrCreate(subscriptionId) {
  let cursor = document.getElementById(`cursor-${subscriptionId}`);
  if (cursor == null) {
    cursor = document.getElementById("cursor-template").cloneNode(true);
    cursor.id = `cursor-${subscriptionId}`;
    cursor.style.fill = COLORS[Math.floor(Math.random() * (COLORS.length-1))];
    cursorsContainer.appendChild(cursor);
  }
  return cursor;
}

function deleteCursor(subscriptionId) {
  const cursor = document.getElementById(`cursor-${subscriptionId}`);
  if (cursor) {
      cursor.parentNode.removeChild(cursor);
  }
}

function hideCursor(subscriptionId) {
  const cursor = document.getElementById(`cursor-${subscriptionId}`);
  if (cursor) {
    cursor.style.opacity = "0";
  }
}

document.addEventListener("pointermove", (e) => {
  const percentOffsetX = e.clientX / window.innerWidth;
  const percentOffsetY = e.clientY / window.innerHeight;

  UsersCursorsStream.emit('updateCursor', {
    x: percentOffsetX, //Math.random()* window.innerWidth,
    y: percentOffsetY //Math.random()* window.innerHeight,
  });
});

document.addEventListener("pointerleave", (e) => {
  // room.updatePresence({ cursor: null });
  UsersCursorsStream.emit('hideCursor', {
    x: e.clientX, //Math.random()* window.innerWidth,
    y: e.clientY //Math.random()* window.innerHeight,
  });
});

onMount(()=>{
  UsersCursorsStream.emit('new_user', "");
  // document.getElementById("cursors-container");
  // console.log(UsersCursorsStream, cursorsContainer)
  // setInterval( () => {
  //   UsersCursorsStream.emit('updateCursor', {
  //       x: Math.random()* window.innerWidth,
  //       y: Math.random()* window.innerHeight,
  //   });
  // }, 1000);
});

</script>
<svg
  id="cursor-template"
  style="
    position: absolute;
    left: 0;
    top: 0;
    transition: transform 0.1s cubic-bezier(0.17, 0.93, 0.38, 1);
    fill: transparent;
  "
  width="24"
  height="36"
  viewBox="0 0 24 36"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
  />
</svg>

<!-- <div
  style="
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
  "
>
  Move your cursor to broadcast its position to other people in the room
</div> -->

<div id="cursors-container" bind:this={cursorsContainer} style="height: 100vh; width: 100vw; z-index:-999;border: 5px solid red"></div>
