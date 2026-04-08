(function () {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;
  const threshold = 50;

  function handleGesture() {
    const dx = endX - startX;
    const dy = endY - startY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) {
        document.dispatchEvent(new CustomEvent("aam-swipe-right"));
      } else if (dx < -threshold) {
        document.dispatchEvent(new CustomEvent("aam-swipe-left"));
      }
    } else {
      if (dy > threshold) {
        document.dispatchEvent(new CustomEvent("aam-swipe-down"));
      } else if (dy < -threshold) {
        document.dispatchEvent(new CustomEvent("aam-swipe-up"));
      }
    }
  }

  document.addEventListener("touchstart", function (e) {
    const t = e.changedTouches[0];
    startX = t.screenX;
    startY = t.screenY;
  }, {passive:true});

  document.addEventListener("touchend", function (e) {
    const t = e.changedTouches[0];
    endX = t.screenX;
    endY = t.screenY;
    handleGesture();
  }, {passive:true});
})();
