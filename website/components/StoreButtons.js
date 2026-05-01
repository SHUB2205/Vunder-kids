const APP_STORE_URL = 'https://apps.apple.com/us/app/fisiko-ai/id6759229981'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=io.fisiko.www.twa'

export default function StoreButtons({ variant = 'dark' }) {
  const isLight = variant === 'light'
  const baseClasses =
    'inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5'
  const darkBtn = 'bg-gray-900 text-white hover:bg-black'
  const lightBtn = 'bg-white text-gray-900 hover:bg-gray-100'
  const btnClass = `${baseClasses} ${isLight ? lightBtn : darkBtn}`

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* App Store */}
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Download on the App Store"
      >
        <svg viewBox="0 0 384 512" className="w-7 h-7" fill="currentColor" aria-hidden="true">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>
        <div className="text-left leading-tight">
          <div className="text-[11px] opacity-75">Download on the</div>
          <div className="text-lg font-bold -mt-0.5">App Store</div>
        </div>
      </a>

      {/* Play Store */}
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        aria-label="Get it on Google Play"
      >
        <svg viewBox="0 0 512 512" className="w-7 h-7" aria-hidden="true">
          <path fill="#00D4FF" d="M325.3 234.3 104.6 13.6 391.6 178z" />
          <path fill="#FFCE00" d="m104.6 13.6 220.7 220.7-220.7 220.7c-9.4-3.6-15.6-12.7-15.6-23.3V36.9c0-10.6 6.2-19.7 15.6-23.3z" />
          <path fill="#FF3C5C" d="M325.3 234.3 391.6 178 104.6 13.6c-1.5-.6-3.1-1-4.7-1.3l225.4 222z" />
          <path fill="#00F076" d="M325.3 234.3 99.9 456.4c1.6-.3 3.2-.7 4.7-1.3L391.6 290.6z" />
        </svg>
        <div className="text-left leading-tight">
          <div className="text-[11px] opacity-75">GET IT ON</div>
          <div className="text-lg font-bold -mt-0.5">Google Play</div>
        </div>
      </a>
    </div>
  )
}
