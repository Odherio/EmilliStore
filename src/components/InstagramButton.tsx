const INSTAGRAM_URL =
  'https://www.instagram.com/emillistore_?stkn=ZWp6NWE0bmwwdWxu'

export function InstagramButton() {
  return (
    <div className="instagram-fab group fixed bottom-[5.25rem] right-4 z-30 sm:bottom-6">
      <div className="instagram-tooltip pointer-events-none absolute bottom-[calc(100%+14px)] left-1/2 w-56 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="rounded-2xl bg-[#2a2b2f] p-3 shadow-xl ring-1 ring-[#52382f]">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpg"
              alt=""
              className="h-11 w-11 rounded-xl object-cover ring-1 ring-[#e6683c]"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#e6683c]">
                EmilliStore
              </p>
              <p className="truncate text-xs text-white/80">@emillistore_</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-white/55">Moda feminina · Goiânia</p>
        </div>
      </div>

      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="instagram-icon relative block text-white"
        aria-label="Instagram EmilliStore"
      >
        <div className="instagram-layer relative h-14 w-14 transition-transform duration-300 group-hover:-rotate-[35deg] group-hover:skew-x-[20deg]">
          <span />
          <span />
          <span />
          <span />
          <span className="instagram-gradient flex items-center justify-center">
            <svg
              fill="white"
              className="h-6 w-6"
              viewBox="0 0 448 512"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
            </svg>
          </span>
        </div>
        <span className="instagram-label pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium text-[#e6683c] opacity-0 transition-all duration-300 group-hover:bottom-[-1.75rem] group-hover:opacity-100">
          Instagram
        </span>
      </a>
    </div>
  )
}
