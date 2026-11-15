import { useState, useEffect } from 'react'

const useDetectMobile = () => {
    const [mobile, setMobile] = useState(false)

    useEffect(() => {
        const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent
        const isMobile = Boolean(
            userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)
        )
        setMobile(isMobile)
    }, [])

    return mobile
}

export default useDetectMobile
