// Initialize Supabase client
const SUPABASE_URL = 'https://jiralwhytbvzdnkcekab.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcmFsd2h5dGJ2emRua2Nla2FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NDMwNzUsImV4cCI6MjA5NDIxOTA3NX0.hsSFIY2Lfr39w2MJ0deByke6gQB8B55d13qopFNGVzk';

// Correct initialization for the global Supabase object from the CDN
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to update a single telemetry card
function updateTelemetryCard(id, value, unit = "") {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = `${value}${unit}`;
    }
}

// Function to update the battery progress bar
function updateBatteryProgressBar(percentage) {
    const progressBar = document.getElementById("battery-progress-bar");
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

// Function to fetch initial data
async function fetchInitialTelemetryData() {
    try {
        const { data, error } = await supabaseClient
            .from('live_telemetry')
            .select('*')
            .order('flight_time', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            const telemetry = data[0];
            updateUI(telemetry);
            resetWatchdog(); // Reset watchdog when we get initial telemetry
        }
    } catch (error) {
        console.error('Error fetching initial telemetry data:', error.message);
    }
}

// Function to update all UI elements
function updateUI(telemetry) {
    // Update drone location on map
    if (telemetry["x axis"] !== undefined && telemetry["y axis"] !== undefined) {
        updateDroneLocation(telemetry["x axis"], telemetry["y axis"]);
    }
    if (telemetry.battery !== undefined) {
        updateTelemetryCard("battery-percentage", telemetry.battery, "%");
        updateTelemetryCard("battery-remaining", telemetry.battery, "% remaining");
        updateBatteryProgressBar(telemetry.battery);
    }
    if (telemetry.flight_time !== undefined) {
        updateTelemetryCard("flight-time", formatFlightTime(telemetry.flight_time));
    }
    if (telemetry.wind_speed !== undefined) {
        updateTelemetryCard("wind-speed", telemetry.wind_speed, " m/s");
    }
    if (telemetry.distance !== undefined) {
        updateTelemetryCard("distance", telemetry.distance, " km");
    }
    if (telemetry["x axis"] !== undefined) {
        updateTelemetryCard("gps-lat-coord", telemetry["x axis"]);
    }
    if (telemetry["y axis"] !== undefined) {
        updateTelemetryCard("gps-long-coord", telemetry["y axis"]);
    }
    if (telemetry["z axis"] !== undefined) {
        updateTelemetryCard("altitude-coord", telemetry["z axis"]);
    }
    if (telemetry.speed !== undefined) {
        updateTelemetryCard("speed-coord", telemetry.speed);
    }
    if (telemetry.signal_strength !== undefined) {
        updateTelemetryCard("signal-strength-coord", telemetry.signal_strength);
    }
    if (telemetry.temperature !== undefined) {
        updateTelemetryCard("rpi-temperature", telemetry.temperature, "°C");
    }
    if (telemetry.status !== undefined) {
        updateTelemetryCard("drone-status", telemetry.status);
    }
}

// Function to map real-world coordinates to SVG coordinates and update UI
function updateDroneLocation(latitude, longitude) {
    const svgMap = document.querySelector(".map-grid svg");
    if (!svgMap) return;

    const svgWidth = 300; // viewBox width
    const svgHeight = 300; // viewBox height
    const padding = 20; // from the p-4 class on the SVG element

    // Define your real-world coordinate bounds (adjust as needed for your location)
    const minLat = 0; 
    const maxLat = 50;
    const minLong = 0;
    const maxLong = 50;

    // Calculate normalized coordinates (0 to 1)
    const normLat = (latitude - minLat) / (maxLat - minLat);
    const normLong = (longitude - minLong) / (maxLong - minLong);

    // Map to SVG pixel coordinates, accounting for padding
    // In SVG, Y-axis typically goes down, so we invert latitude for visual consistency
    const mappedX = padding + normLong * (svgWidth - 2 * padding);
    const mappedY = padding + (1 - normLat) * (svgHeight - 2 * padding);

    // Update the drone marker position
    const droneMarker = document.getElementById("drone-location-marker");
    if (droneMarker) {
        droneMarker.setAttribute("transform", `translate(${mappedX}, ${mappedY})`);
    }
}



// Helper function to format flight time (e.g., 1.5 hours to 01:30:00)
function formatFlightTime(hours) {
    if (typeof hours !== 'number' || isNaN(hours)) {
        return 'N/A';
    }
    const totalSeconds = Math.floor(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Real-time subscription
supabaseClient
    .channel('public:live_telemetry')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'live_telemetry' }, payload => {
        if (payload.new) {
            updateUI(payload.new);
            resetWatchdog();
        }
    })
    .subscribe();

// Helper function to format a timestamp for display
function formatTimestamp(isoString) {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString(); 
}

// Function to fetch the latest aerial inspection image
async function fetchLatestAerialInspection() {
    try {
        const { data: inspectionData, error: inspectionError } = await supabaseClient
            .from('aerial_inspection')
            .select('*')
            .order('timestamp', { ascending: false, nullsFirst: false }) 
            .limit(1);

        if (inspectionError) throw inspectionError;

        if (inspectionData && inspectionData.length > 0) {
            const inspection = inspectionData[0];
            let aeroInspectionTime = "N/A";
            let x = inspection.latitude !== null ? inspection.latitude : "N/A";
            let y = inspection.longitude !== null ? inspection.longitude : "N/A";
            let z = "N/A";

            // If coordinates are still N/A, try to parse from image_path
            if (x === "N/A" || y === "N/A") {
                const path = inspection.image_path;
                if (path) {
                    const match = path.match(/pos_([-0-9.]+)_([-0-9.]+)_([-0-9.]+)/);
                    if (match) {
                        x = parseFloat(match[1]);
                        y = parseFloat(match[2]);
                        z = parseFloat(match[3]);
                    }
                }
            }

            if (inspection.telemetry_id) {
                const { data: telemetryData, error: telemetryError } = await supabaseClient
                    .from('live_telemetry')
                    .select('flight_time, "x axis", "y axis", "z axis"')
                    .eq('id', inspection.telemetry_id)
                    .single();

                if (telemetryError) {
                    console.error('Error fetching associated telemetry:', telemetryError.message);
                } else if (telemetryData) {
                    if (telemetryData.flight_time !== undefined && telemetryData.flight_time !== null) {
                        aeroInspectionTime = formatFlightTime(telemetryData.flight_time);
                    }
                    if (x === "N/A") x = telemetryData["x axis"] !== undefined ? telemetryData["x axis"] : "N/A";
                    if (y === "N/A") y = telemetryData["y axis"] !== undefined ? telemetryData["y axis"] : "N/A";
                    if (z === "N/A") z = telemetryData["z axis"] !== undefined ? telemetryData["z axis"] : "N/A";
                }
            }
            updateAerialInspectionDetails(inspection.image_path, inspection.timestamp, x, y, z, aeroInspectionTime);
        }
    } catch (error) {
        console.error('Error fetching latest aerial inspection:', error.message);
    }
}

// Function to update the drone feed image and details
function updateAerialInspectionDetails(imagePath, timestamp, x, y, z, aeroInspectionTime) {
    const droneImage = document.getElementById("drone-feed-image");
    if (droneImage && imagePath) {
        let imageUrl = imagePath;

        // Clean up imagePath if it's wrapped in extra quotes (as seen in some DB entries)
        if (typeof imagePath === 'string') {
            imagePath = imagePath.replace(/^"|"$/g, '');
        }

        // Handle full URLs
        if (imagePath.startsWith('http')) {
            imageUrl = imagePath;
        } 
        // Handle Base64
        else if (imagePath.length > 100 && (imagePath.startsWith('/') || /^[A-Za-z0-9+/=]+$/.test(imagePath.substring(0, 50)))) {
            // Check if it already has the data URI prefix
            if (!imagePath.startsWith('data:image')) {
                imageUrl = `data:image/jpeg;base64,${imagePath}`;
            } else {
                imageUrl = imagePath;
            }
        }
        // Handle relative storage paths
        else if (!imagePath.startsWith('/') && !imagePath.includes(':')) {
            imageUrl = `${SUPABASE_URL}/storage/v1/object/public/photos/${imagePath}`;
        }
        // Fallback for local-looking paths or anything else
        else {
            imageUrl = imagePath;
        }

        console.log("Updating drone feed image to:", imageUrl);
        droneImage.src = imageUrl;
    }

    const tsEl = document.getElementById("image-timestamp");
    if (tsEl) tsEl.textContent = formatTimestamp(timestamp);
    
    const xEl = document.getElementById("image-x-coord");
    if (xEl) xEl.textContent = typeof x === 'number' ? x.toFixed(4) : x;
    
    const yEl = document.getElementById("image-y-coord");
    if (yEl) yEl.textContent = typeof y === 'number' ? y.toFixed(4) : y;

    const zEl = document.getElementById("image-z-coord");
    if (zEl) zEl.textContent = typeof z === 'number' ? z.toFixed(4) : z;
    
    const aeroEl = document.getElementById("aero-inspection-time");
    if (aeroEl) aeroEl.textContent = aeroInspectionTime;
}

// Watchdog for resetting dashboard to zero/-1 when data stops
let dashboardWatchdog = null;
const WATCHDOG_TIMEOUT = 15000; // 15 seconds of inactivity

function resetWatchdog() {
    if (dashboardWatchdog) clearTimeout(dashboardWatchdog);
    dashboardWatchdog = setTimeout(resetDashboardToDefault, WATCHDOG_TIMEOUT);
}

function resetDashboardToDefault() {
    console.log("No data received recently. Resetting dashboard to default...");
    
    // Telemetry reset
    const telemetryElements = [
        "gps-lat-coord", "gps-long-coord", "altitude-coord", "speed-coord", 
        "signal-strength-coord", "battery-percentage", "battery-remaining",
        "flight-time", "wind-speed", "distance", "rpi-temperature"
    ];
    
    telemetryElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "-1";
    });

    const batteryBar = document.getElementById("battery-progress-bar");
    if (batteryBar) batteryBar.style.width = "0%";

    const droneStatus = document.getElementById("drone-status");
    if (droneStatus) droneStatus.textContent = "inactive";

    // Inspection details reset (timestamps/coords) but NOT the image itself
    const inspectionElements = [
        "image-timestamp", "image-x-coord", "image-y-coord", "image-z-coord", "aero-inspection-time"
    ];
    inspectionElements.forEach(id => {
        const el = document.getElementById(id);
        if (el && id !== "drone-feed-image") el.textContent = "0";
    });

    // AI Stats reset
    const statElements = [
        "stats-images-taken", "stats-buildings-covered", "stats-area-inspected",
        "stats-cracks", "stats-water", "stats-rust", "stats-uneven"
    ];
    statElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "0";
    });
}

// Function to update AI Detection Stats UI
function updateAIStatsUI(stats) {
    if (stats.images_taken !== undefined) {
        const el = document.getElementById("stats-images-taken");
        if (el) el.textContent = stats.images_taken;
    }
    if (stats.buildings_covered !== undefined) {
        const el = document.getElementById("stats-buildings-covered");
        if (el) el.textContent = stats.buildings_covered;
    }
    if (stats.area_inspected !== undefined) {
        const el = document.getElementById("stats-area-inspected");
        if (el) el.innerHTML = `${stats.area_inspected} <span class="text-xs font-normal">Acres</span>`;
    }
    if (stats.cracks !== undefined) {
        const el = document.getElementById("stats-cracks");
        if (el) el.textContent = stats.cracks;
    }
    if (stats.water !== undefined) {
        const el = document.getElementById("stats-water");
        if (el) el.textContent = stats.water;
    }
    if (stats.rust !== undefined) {
        const el = document.getElementById("stats-rust");
        if (el) el.textContent = stats.rust;
    }
    if (stats.uneven !== undefined) {
        const el = document.getElementById("stats-uneven");
        if (el) el.textContent = stats.uneven;
    }

    // Update Chart if it exists
    if (window.defectChart) {
        const chartData = [
            stats.cracks || 0,
            stats.water || 0,
            stats.rust || 0,
            stats.uneven || 0
        ];
        
        window.defectChart.data.datasets[0].data = chartData;
        window.defectChart.update();
    }
}

// Function to fetch initial AI Detection Stats
async function fetchInitialAIStats() {
    try {
        const { data, error } = await supabaseClient
            .from('live_ai_stats')
            .select('*')
            .order('id', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            updateAIStatsUI(data[0]);
        }
    } catch (error) {
        console.error('Error fetching initial AI stats:', error.message);
    }
}

// Initial data fetch on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if window.supabase is available from the CDN script
    if (window.supabase) {
        fetchInitialTelemetryData();
        fetchLatestAerialInspection();
        fetchInitialAIStats();
        resetWatchdog();
    } else {
        console.error('Supabase client library not loaded from CDN.');
    }
});

// Real-time subscription for aerial_inspection
supabaseClient
    .channel('public:aerial_inspection')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'aerial_inspection' }, async payload => {
        if (payload.new) {
            console.log("New aerial inspection received:", payload.new);
            const inspection = payload.new;
            let aeroInspectionTime = "N/A";
            let x = inspection.latitude !== null ? inspection.latitude : "N/A";
            let y = inspection.longitude !== null ? inspection.longitude : "N/A";
            let z = "N/A";

            // If coordinates are still N/A, try to parse from image_path
            if (x === "N/A" || y === "N/A") {
                const path = inspection.image_path;
                const match = path.match(/pos_([-0-9.]+)_([-0-9.]+)_([-0-9.]+)/);
                if (match) {
                    x = parseFloat(match[1]);
                    y = parseFloat(match[2]);
                    z = parseFloat(match[3]);
                }
            }

            // If we have telemetry_id, we can fetch the associated telemetry for better metadata (like flight_time)
            if (inspection.telemetry_id) {
                const { data: telemetryData } = await supabaseClient
                    .from('live_telemetry')
                    .select('flight_time, "x axis", "y axis", "z axis"')
                    .eq('id', inspection.telemetry_id)
                    .single();

                if (telemetryData) {
                    if (telemetryData.flight_time !== undefined && telemetryData.flight_time !== null) {
                        aeroInspectionTime = formatFlightTime(telemetryData.flight_time);
                    }
                    if (x === "N/A") x = telemetryData["x axis"] !== undefined ? telemetryData["x axis"] : "N/A";
                    if (y === "N/A") y = telemetryData["y axis"] !== undefined ? telemetryData["y axis"] : "N/A";
                    if (z === "N/A") z = telemetryData["z axis"] !== undefined ? telemetryData["z axis"] : "N/A";
                }
            }
            
            updateAerialInspectionDetails(inspection.image_path, inspection.timestamp, x, y, z, aeroInspectionTime);
            
            // Also update the detection stats if provided in the insert
            if (inspection.detected_cracks !== undefined || inspection.detected_water !== undefined) {
                // We might want to trigger a refresh of AI stats or update them incrementally
                fetchInitialAIStats(); 
            }
        }
    })
    .subscribe();

// Real-time subscription for live_ai_stats
supabaseClient
    .channel('public:live_ai_stats')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'live_ai_stats' }, payload => {
        if (payload.new) {
            updateAIStatsUI(payload.new);
            resetWatchdog();
        }
    })
    .subscribe();

// --- Device Controls Logic ---

const CONTROL_ID = '00000000-0000-0000-0000-000000000001';
let controlDebounceTimer = null;
let isRemoteUpdating = false;

// Function to update device controls in Supabase
async function updateDeviceControls(updates) {
    if (isRemoteUpdating) return;
    
    try {
        const { error } = await supabaseClient
            .from('device_controls')
            .update(updates)
            .eq('id', CONTROL_ID);

        if (error) {
            console.error('Supabase update error:', error.message);
            throw error; 
        } else {
        }
    } catch (error) {
        console.error('Error updating device controls (catch block):', error.message);
    }
}

// Debounce wrapper
function debouncedUpdate(updates) {
    if (controlDebounceTimer) clearTimeout(controlDebounceTimer);
    controlDebounceTimer = setTimeout(() => {
        updateDeviceControls(updates);
    }, 150); // 150ms debounce
}

// Update UI from database
function updateControlsUI(controls) {
    isRemoteUpdating = true;
    
    if (controls.joystick_x !== undefined && controls.joystick_y !== undefined) {
        const joystick = document.getElementById('interactive-joystick');
        if (joystick) {
            // Convert normalized -1 to 1 back to pixels (radiusLimit is 35 in dashboard.html)
            const moveX = controls.joystick_x * 35;
            const moveY = controls.joystick_y * 35;
            joystick.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    }

    if (controls.gimbal_tilt !== undefined) {
        const tiltSlider = document.getElementById('tilt-slider');
        const tiltVal = document.getElementById('tilt-val');
        if (tiltSlider) tiltSlider.value = controls.gimbal_tilt;
        if (tiltVal) tiltVal.textContent = controls.gimbal_tilt + '°';
    }

    if (controls.camera_zoom !== undefined) {
        const zoomSlider = document.getElementById('zoom-slider');
        const zoomVal = document.getElementById('zoom-val');
        if (zoomSlider) zoomSlider.value = controls.camera_zoom;
        if (zoomVal) zoomVal.textContent = parseFloat(controls.camera_zoom).toFixed(1) + 'x';
    }

    setTimeout(() => { isRemoteUpdating = false; }, 50);
}

// Fetch initial control state
async function fetchInitialControls() {
    try {
        const { data, error } = await supabaseClient
            .from('device_controls')
            .select('*')
            .eq('id', CONTROL_ID)
            .single();

        if (error) throw error;
        if (data) updateControlsUI(data);
    } catch (error) {
        console.error('Error fetching initial controls:', error.message);
    }
}

// Subscribe to realtime control changes
supabaseClient
    .channel('public:device_controls')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'device_controls', filter: `id=eq.${CONTROL_ID}` }, payload => {
        if (payload.new && !isRemoteUpdating) {
            updateControlsUI(payload.new);
        }
    })
    .subscribe();

// Setup event listeners for local changes
function setupControlListeners() {
    const tiltSlider = document.getElementById('tilt-slider');
    const zoomSlider = document.getElementById('zoom-slider');

    if (tiltSlider) {
        tiltSlider.addEventListener('input', (e) => {
            if (isRemoteUpdating) return;
            const val = parseInt(e.target.value);
            document.getElementById('tilt-val').textContent = val + '°';
            debouncedUpdate({ gimbal_tilt: val });
        });
    }

    if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => {
            if (isRemoteUpdating) return;
            const val = parseFloat(e.target.value);
            document.getElementById('zoom-val').textContent = val.toFixed(1) + 'x';
            debouncedUpdate({ camera_zoom: val });
        });
    }
}

// Re-expose a hook for the joystick in dashboard.html to call
window.onJoystickMove = function(x, y) {
    if (isRemoteUpdating) return;
    // x and y are pixels, normalize to -1 to 1 based on 35px radius
    const normX = parseFloat((x / 35).toFixed(3));
    const normY = parseFloat((y / 35).toFixed(3));
    debouncedUpdate({ joystick_x: normX, joystick_y: normY });
};

// Update DOMContentLoaded to include controls
// The existing DOMContentLoaded listener in dashboard.html is already running fetchInitialTelemetryData, fetchLatestAerialInspection, fetchInitialAIStats.
// We need to ensure fetchInitialControls and setupControlListeners are also called.
// One way is to append to the existing DOMContentLoaded or create a new script block in dashboard.html that runs after.
// For now, let's assume the existing script block in dashboard.html will call these at the end.

// Since supabase-telemetry.js is loaded before the main script in dashboard.html,
// we can call these from a DOMContentLoaded listener in this file as well.
document.addEventListener('DOMContentLoaded', () => {
    if (window.supabase) {
        fetchInitialControls();
        setupControlListeners();
    }
});