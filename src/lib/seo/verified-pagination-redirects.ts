const PAGE_ONE_PATH_REDIRECTS: Readonly<Record<string, string>> = {
  "/products/ai-supercomputers-hpc/nvidia-dgx-servers/page/1":
    "/products/ai-supercomputers-hpc/nvidia-dgx-servers",
  "/products/ai-supercomputers-hpc/page/1": "/products/ai-supercomputers-hpc",
  "/products/blackmagic/atem-production-switcher/page/1":
    "/products/blackmagic/atem-production-switcher",
  "/products/blackmagic/broadcast-convertor/page/1": "/products/blackmagic/broadcast-convertor",
  "/products/blackmagic/capture-playback/page/1": "/products/blackmagic/capture-playback",
  "/products/blackmagic/cintel-scanner/page/1": "/products/blackmagic/cintel-scanner",
  "/products/blackmagic/cloud-network-storage/page/1": "/products/blackmagic/cloud-network-storage",
  "/products/blackmagic/davinci-resolve/page/1": "/products/blackmagic/davinci-resolve",
  "/products/blackmagic/disk-recorder/page/1": "/products/blackmagic/disk-recorder",
  "/products/blackmagic/monitoring/page/1": "/products/blackmagic/monitoring",
  "/products/blackmagic/multiview/page/1": "/products/blackmagic/multiview",
  "/products/blackmagic/page/1": "/products/blackmagic",
  "/products/blackmagic/professional-camera/page/1": "/products/blackmagic/professional-camera",
  "/products/blackmagic/routing-distribution/page/1": "/products/blackmagic/routing-distribution",
  "/products/blackmagic/standard-conversion/page/1": "/products/blackmagic/standard-conversion",
  "/products/blackmagic/streaming-encoding/page/1": "/products/blackmagic/streaming-encoding",
  "/products/blackmagic/ultimate/page/1": "/products/blackmagic/ultimate",
  "/products/imaging-cameras-equipment/industrial-camera-modules/page/1":
    "/products/imaging-cameras-equipment/industrial-camera-modules",
  "/products/imaging-cameras-equipment/page/1": "/products/imaging-cameras-equipment",
  "/products/industrial-cctv-camera/black-wonder/page/1":
    "/products/industrial-cctv-camera/black-wonder",
  "/products/industrial-cctv-camera/page/1": "/products/industrial-cctv-camera",
  "/products/industrial-cctv-camera/thermal-cctv-camera/page/1":
    "/products/industrial-cctv-camera/thermal-cctv-camera",
  "/products/others/accessories/page/1": "/products/others/accessories",
  "/products/others/hard-disk/page/1": "/products/others/hard-disk",
  "/products/others/page/1": "/products/others",
  "/products/page/1": "/products",
  "/products/reolink-cctv-camera/4g/page/1": "/products/reolink-cctv-camera/4g",
  "/products/reolink-cctv-camera/battery/page/1": "/products/reolink-cctv-camera/battery",
  "/products/reolink-cctv-camera/bullet/page/1": "/products/reolink-cctv-camera/bullet",
  "/products/reolink-cctv-camera/dome/page/1": "/products/reolink-cctv-camera/dome",
  "/products/reolink-cctv-camera/dual-lens/page/1": "/products/reolink-cctv-camera/dual-lens",
  "/products/reolink-cctv-camera/ip/page/1": "/products/reolink-cctv-camera/ip",
  "/products/reolink-cctv-camera/night-vision/page/1": "/products/reolink-cctv-camera/night-vision",
  "/products/reolink-cctv-camera/nvr/page/1": "/products/reolink-cctv-camera/nvr",
  "/products/reolink-cctv-camera/page/1": "/products/reolink-cctv-camera",
  "/products/reolink-cctv-camera/ptz/page/1": "/products/reolink-cctv-camera/ptz",
  "/products/reolink-cctv-camera/wifi/page/1": "/products/reolink-cctv-camera/wifi",
  "/products/x-ray/airport-luggage/page/1": "/products/x-ray/airport-luggage",
  "/products/x-ray/page/1": "/products/x-ray",
  "/products/x-ray/smiths-detection/page/1": "/products/x-ray/smiths-detection",
  "/products/x-ray/vehicle-truck/page/1": "/products/x-ray/vehicle-truck",
};

const PAGE_ONE_QUERY_PATHS = new Set(Object.values(PAGE_ONE_PATH_REDIRECTS));

const PAGE_TWO_QUERY_REDIRECTS: Readonly<Record<string, string>> = {
  "/products": "/products/page/2",
  "/products/x-ray": "/products/x-ray",
  "/products/x-ray/airport-luggage": "/products/x-ray/airport-luggage",
};

export function getVerifiedPageOnePathRedirect(pathname: string): string | null {
  return PAGE_ONE_PATH_REDIRECTS[pathname] ?? null;
}

export function getVerifiedListingQueryRedirect(pathname: string, page: string): string | null {
  if (page === "1" && PAGE_ONE_QUERY_PATHS.has(pathname)) return pathname;
  if (page === "2") return PAGE_TWO_QUERY_REDIRECTS[pathname] ?? null;
  return null;
}
