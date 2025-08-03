document.addEventListener('DOMContentLoaded', () => {
    // Get all the clickable <area> elements
    const areas = document.querySelectorAll('map[name="campus-map"] area');

    // Add mouseover and mouseout events to each area
    areas.forEach(area => {
        // When the mouse enters an area
        area.addEventListener('mouseover', () => {
            const pinId = area.dataset.pinId; // Get the pin's ID from the data attribute
            if (pinId) {
                const pin = document.getElementById(pinId);
                if (pin) {
                    pin.classList.add('is-visible'); // Make the corresponding pin visible
                }
            }
        });

        // When the mouse leaves an area
        area.addEventListener('mouseout', () => {
            const pinId = area.dataset.pinId;
            if (pinId) {
                const pin = document.getElementById(pinId);
                if (pin) {
                    pin.classList.remove('is-visible'); // Hide the pin again
                }
            }
        });
    });
});