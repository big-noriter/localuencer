declare global {
  interface Window {
    google: {
      earth: {
        createInstance: (container: HTMLElement) => Promise<GoogleEarthInstance>
        LAYER_ATMOSPHERE: string
        VISIBILITY_SHOW: string
      }
    }
  }
}

interface GoogleEarthInstance {
  createLookAt: (name: string) => GoogleEarthLookAt
  getView: () => GoogleEarthView
  getNavigationControl: () => GoogleEarthNavigationControl
  getLayerRoot: () => GoogleEarthLayerRoot
  LAYER_ATMOSPHERE: string
  VISIBILITY_SHOW: string
}

interface GoogleEarthLookAt {
  setLatitude: (lat: number) => void
  setLongitude: (lng: number) => void
  setAltitude: (alt: number) => void
  setHeading: (heading: number) => void
  setTilt: (tilt: number) => void
  setRange: (range: number) => void
}

interface GoogleEarthView {
  setAbstractView: (lookAt: GoogleEarthLookAt) => void
}

interface GoogleEarthNavigationControl {
  setVisibility: (visibility: string) => void
}

interface GoogleEarthLayerRoot {
  enableLayerById: (layerId: string, enabled: boolean) => void
}

export {} 