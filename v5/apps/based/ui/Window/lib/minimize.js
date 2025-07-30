 export default function minimize(force = false) {
        // console.log('minimize', this.isMinimized);

        if (false && this.bp.isMobile()) {

            if (this.isMinimized && !force) {
                this.restore();
                // this.content.style.display = "block"; // Show content area
            } else {
                // Minimize the window
                // this.container.style.display = "none";  // Hide content area
                // hides the `bp-window-content` area
                //this.content.style.display = "none";  // Hide content area
                // set the window-container height to 50px
                this.container.style.height = "120px"; // Set height to 50px

                this.isMinimized = true;
            }

            // this.windowManager.arrangeVerticalStacked();

        } else {
            if (this.isMinimized && !force) {
                this.restore();
            } else {
                // Minimize the window
                this.container.style.display = "none";  // Hide content area
                this.isMinimized = true;
            }
        }
        // TODO: save the window state
    }