import { useState, useEffect, useLayoutEffect } from 'react'

export const sizeObj = {
    largeScreen: 4,
    mediumScreen: 3,
    smallScreen: 2,
    extraSmallScreen: 1
}

const screenWidthObj = {
    w1: 1920,
    w2: 1200,
    w3: 992,
    w4:768
}

function useSizeMode() {
    const [sizeMode, setSizeMode] = useState(0)

    useLayoutEffect(() => {
        const currentSizeMode = getSizeMode(window.innerWidth)
        setSizeMode(currentSizeMode)
    }, [])

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    function handleResize() {
        const currentSizeMode = getSizeMode(window.innerWidth)
        setSizeMode(currentSizeMode)
    }

    return sizeMode
}

function getSizeMode(screenWidth) {
    if(screenWidth >= screenWidthObj.w1) {
        return sizeObj.largeScreen  
    } 

    if(screenWidth < screenWidthObj.w1 && screenWidth >= screenWidthObj.w2) {
        return sizeObj.mediumScreen
    }

    if(screenWidth < screenWidthObj.w2 && screenWidth >= screenWidthObj.w3) {
        return sizeObj.smallScreen
    }

    if(screenWidth < screenWidthObj.w3) {
        return sizeObj.extraSmallScreen
    }

    return 0;
}

export default useSizeMode