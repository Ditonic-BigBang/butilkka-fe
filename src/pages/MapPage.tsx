import { useState, useCallback } from 'react'
import KakaoMap from '../components/KakaoMap'
import BottomSheet from '../components/BottomSheet'
import { type DistrictInfo } from '../data/seoulDistrictData'

export default function MapPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null)

  const handleDistrictClick = useCallback((district: DistrictInfo) => {
    setSelectedDistrict(district)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedDistrict(null)
  }, [])

  return (
    <div className="map-page">
      <KakaoMap onDistrictClick={handleDistrictClick} />
      <BottomSheet district={selectedDistrict} onClose={handleClose} />
    </div>
  )
}
