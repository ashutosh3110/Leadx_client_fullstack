import React from "react"
import { useCustomization } from "../../context/CustomizationContext"

const AmbassadorCard = ({ ambassador, onChat, onViewProfile }) => {
  const { customization } = useCustomization()

  const getLocation = () => {
    if (ambassador.location) {
      return ambassador.location
    }

    // If country is India, show state | country
    const country = ambassador.country?.trim()
    if (
      country === "India" ||
      country === "india" ||
      country?.toLowerCase() === "india"
    ) {
      return `${ambassador.state || ""} | ${ambassador.country || "India"}`
    }

    // For other countries, show only country
    return ambassador.country || "India"
  }

  const getCountryFlag = (country) => {
    const countryCodeMap = {
      India: "in",
      "United States": "us",
      USA: "us", // Add USA mapping
      US: "us", // Add US mapping
      "United Kingdom": "gb",
      Canada: "ca",
      Australia: "au",
      Germany: "de",
      France: "fr",
      Japan: "jp",
      China: "cn",
      "South Korea": "kr",
      Singapore: "sg",
      Malaysia: "my",
      Thailand: "th",
      Indonesia: "id",
      Philippines: "ph",
      Vietnam: "vn",
      Brazil: "br",
      Argentina: "ar",
      Mexico: "mx",
      Russia: "ru",
      Italy: "it",
      Spain: "es",
      Netherlands: "nl",
      Sweden: "se",
      Norway: "no",
      Denmark: "dk",
      Finland: "fi",
      Switzerland: "ch",
      Austria: "at",
      Belgium: "be",
      Poland: "pl",
      "Czech Republic": "cz",
      Hungary: "hu",
      Portugal: "pt",
      Greece: "gr",
      Turkey: "tr",
      Israel: "il",
      UAE: "ae",
      "Saudi Arabia": "sa",
      Egypt: "eg",
      "South Africa": "za",
      Nigeria: "ng",
      Kenya: "ke",
      "New Zealand": "nz",
      Bangladesh: "bd",
      Pakistan: "pk",
      "Sri Lanka": "lk",
      Nepal: "np",
      Bhutan: "bt",
      Myanmar: "mm",
      Cambodia: "kh",
      Laos: "la",
      Mongolia: "mn",
      Kazakhstan: "kz",
      Uzbekistan: "uz",
      Kyrgyzstan: "kg",
      Tajikistan: "tj",
      Turkmenistan: "tm",
      Afghanistan: "af",
      Iran: "ir",
      Iraq: "iq",
      Syria: "sy",
      Lebanon: "lb",
      Jordan: "jo",
      Kuwait: "kw",
      Qatar: "qa",
      Bahrain: "bh",
      Oman: "om",
      Yemen: "ye",
      Ethiopia: "et",
      Ghana: "gh",
      Morocco: "ma",
      Algeria: "dz",
      Tunisia: "tn",
      Libya: "ly",
      Sudan: "sd",
      Chile: "cl",
      Peru: "pe",
      Colombia: "co",
      Venezuela: "ve",
      Ecuador: "ec",
      Bolivia: "bo",
      Paraguay: "py",
      Uruguay: "uy",
      Guyana: "gy",
      Suriname: "sr",
      "French Guiana": "gf",
      Cuba: "cu",
      Jamaica: "jm",
      Haiti: "ht",
      "Dominican Republic": "do",
      "Puerto Rico": "pr",
      "Trinidad and Tobago": "tt",
      Barbados: "bb",
      Bahamas: "bs",
      Belize: "bz",
      "Costa Rica": "cr",
      Panama: "pa",
      Nicaragua: "ni",
      Honduras: "hn",
      "El Salvador": "sv",
      Guatemala: "gt",
      Ukraine: "ua",
      Belarus: "by",
      Moldova: "md",
      Romania: "ro",
      Bulgaria: "bg",
      Serbia: "rs",
      Croatia: "hr",
      Slovenia: "si",
      Slovakia: "sk",
      Lithuania: "lt",
      Latvia: "lv",
      Estonia: "ee",
      Iceland: "is",
      Ireland: "ie",
      Luxembourg: "lu",
      Malta: "mt",
      Cyprus: "cy",
      Albania: "al",
      Macedonia: "mk",
      Montenegro: "me",
      "Bosnia and Herzegovina": "ba",
      Kosovo: "xk",
      Georgia: "ge",
      Armenia: "am",
      Azerbaijan: "az",
      Maldives: "mv",
      Brunei: "bn",
      "East Timor": "tl",
      "Papua New Guinea": "pg",
      Fiji: "fj",
      Samoa: "ws",
      Tonga: "to",
      Vanuatu: "vu",
      "Solomon Islands": "sb",
      Palau: "pw",
      Micronesia: "fm",
      "Marshall Islands": "mh",
      Kiribati: "ki",
      Tuvalu: "tv",
      Nauru: "nr",
    }

    // Case-insensitive matching
    const normalizedCountry = country?.trim()
    const countryCode =
      countryCodeMap[normalizedCountry] ||
      countryCodeMap[normalizedCountry?.toLowerCase()] ||
      countryCodeMap[normalizedCountry?.toUpperCase()] ||
      "in" // Default to India if not found
    return `https://flagcdn.com/24x18/${countryCode}.png`
  }

  const getLanguages = () => {
    // Handle languages from backend - it should be an array
    let languages = ambassador.languages || ambassador.language

    // If languages is an array (as expected from backend)
    if (Array.isArray(languages)) {
      const result = languages.join(" | ")
      return result
    }

    // If it's a string, try to parse it
    if (typeof languages === "string") {
      // Check if it's a JSON string
      try {
        const parsed = JSON.parse(languages)
        if (Array.isArray(parsed)) {
          const result = parsed.join(" | ")
          return result
        }
      } catch (e) {
        // If not JSON, check if it has comma separation
        if (languages.includes(",")) {
          const result = languages
            .split(",")
            .map((lang) => lang.trim())
            .join(" | ")
          return result
        }
      }
    }

    // If single language, return as is
    if (languages) {
      return languages
    }

    // Fallback to default
    return "English"
  }

  const getAbout = () => {
    const fullText =
      ambassador.description || ambassador.about || `Not Available.`
    // Limit to 60 characters to make space for chat button
    return fullText.length > 60 ? fullText.substring(0, 60) + "..." : fullText
  }

  const getOverlayText = () => {
    return {
      title: ambassador.title || "NEVER GIVE UP",
      subtitle:
        ambassador.overlaySubtitle ||
        "You automatically miss 100% of the shots you don't take.",
    }
  }

  console.log(ambassador)
  const getProfileImage = () => {
    const url = `http://localhost:5000/${ambassador.profileImage}`
    return url
  }
  const getBackgroundImageUrl = () => {
    const url = `http://localhost:5000/${ambassador.thumbnailImage}`
    return url
  }

  const overlayText = getOverlayText()

  return (
    <div className="group relative bg-white rounded-2xl transition-all duration-500 border-2 border-slate-200 overflow-hidden w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-[380px] md:h-[400px] flex flex-col">
      {/* Background Image Section - Starting from top */}
      <div className="relative h-20 md:h-24 w-full">
        <img
          src={getBackgroundImageUrl()}
          alt="Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none"
            e.target.parentElement.style.background =
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          }}
        />
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Profile Image Section - Overlapping background image */}
        <div className="absolute -bottom-8 md:-bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="relative flex items-center gap-2">
            {/* Profile Image */}
            <div className="relative w-16 h-16 md:w-16 md:h-16 rounded-full border-4 border-white overflow-hidden">
              <img
                src={getProfileImage()}
                alt={ambassador.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target
                  target.style.display = "none"
                  target.parentElement.innerHTML = `
                                        <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                                            ${ambassador.name
                      .charAt(0)
                      .toUpperCase()}
                                        </div>
                                    `
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="p-2 md:p-2 flex-1 flex flex-col relative overflow-hidden pt-12 md:pt-12 justify-between">
        {/* Info Icon - Right Corner */}
        <div className="absolute top-2 right-2 md:top-2 md:right-2">
          <button
            onClick={() => onViewProfile(ambassador)}
            className="w-6 h-6 md:w-6 md:h-6 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-blue-300 flex items-center justify-center transition-all duration-300 hover:scale-110"
          >
            <svg
              className="w-3 h-3 md:w-3 md:h-3 text-slate-600 hover:text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>

        {/* Content Section - Flexible */}
        <div className="flex-1 flex flex-col">
          {/* Name with Flag - Mobile Only */}
          <div className="md:hidden flex items-center justify-center gap-2 mt-2 mb-2">
            <h3
              className="text-sm font-semibold text-slate-900"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              {ambassador.name?.charAt(0)?.toUpperCase() + ambassador.name?.slice(1)?.toLowerCase()}
            </h3>
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              <img
                src={getCountryFlag(ambassador.country || "India")}
                alt={`${ambassador.country || "India"} flag`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none"
                }}
              />
            </div>
          </div>

          {/* Name - Desktop Only */}
          <h3
            className="hidden md:block relative text-sm font-semibold text-slate-900 text-center mb-2 mt-2"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            {ambassador.name?.charAt(0)?.toUpperCase() + ambassador.name?.slice(1)?.toLowerCase()}
          </h3>

          {/* Mobile Info Section - Show all content like desktop */}
          <div className="md:hidden space-y-0.5 mb-1">
            {/* Program Card */}
            <div className="bg-white/30 backdrop-blur-sm rounded-md p-0.5 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
              <div className="text-center">
                <p
                  className="text-xs font-normal text-slate-900"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {ambassador.course || ambassador.program || "BBA"}
                </p>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white/30 backdrop-blur-sm rounded-md p-0.5 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
              <div className="text-center">
                <p
                  className="text-xs text-slate-900 font-semibold"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  I'm from
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <img
                    src={getCountryFlag(ambassador.country || "India")}
                    alt={`${ambassador.country || "India"} flag`}
                    className="w-4 h-3 object-cover rounded-sm"
                    onError={(e) => {
                      e.target.style.display = "none"
                    }}
                  />
                  <p
                    className="text-xs font-light text-slate-800"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {(() => {
                      const country = ambassador.country?.trim()
                      if (
                        country === "India" ||
                        country === "india" ||
                        country?.toLowerCase() === "india"
                      ) {
                        return `${ambassador.state || ""} | ${ambassador.country || "India"
                          }`
                      }
                      return ambassador.country || "India"
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Languages Card */}
            <div className="bg-white/30 backdrop-blur-sm rounded-md p-0.5 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
              <div className="text-center">
                <p
                  className="text-xs text-slate-900 font-semibold"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  I Speak
                </p>
                <p
                  className="text-xs font-light text-slate-800"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {getLanguages()}
                </p>
              </div>
            </div>

            {/* About Card - Compact */}
            <div className="bg-white/30 backdrop-blur-sm rounded-md p-0.5 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
              <div className="text-center">
                <p
                  className="text-xs text-slate-900 font-semibold"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  About me
                </p>
                <p
                  className="text-xs text-slate-600 leading-tight font-light"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {getAbout()}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Info Section - Card Style - Compact */}
          <div className="hidden md:block space-y-0.5 mb-1">
            {/* Program Card */}
            <div className="bg-white/30 backdrop-blur-sm rounded-md p-0.5 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
              <div className="text-center">
                <p
                  className="text-xs font-normal text-slate-900"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {ambassador.course || ambassador.program || "BBA"}
                </p>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white/30 backdrop-blur-sm rounded-md p-0.5 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
              <div className="text-center">
                <p
                  className="text-xs text-slate-900 font-semibold"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  I'm from
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <img
                    src={getCountryFlag(ambassador.country || "India")}
                    alt={`${ambassador.country || "India"} flag`}
                    className="w-4 h-3 object-cover rounded-sm"
                    onError={(e) => {
                      e.target.style.display = "none"
                    }}
                  />
                  <p
                    className="text-xs font-light text-slate-800"
                    style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  >
                    {(() => {
                      const country = ambassador.country?.trim()
                      if (
                        country === "India" ||
                        country === "india" ||
                        country?.toLowerCase() === "india"
                      ) {
                        return `${ambassador.state || ""} | ${ambassador.country || "India"
                          }`
                      }
                      return ambassador.country || "India"
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Languages Card */}
            <div className="bg-white/30 backdrop-blur-sm rounded-md p-0.5 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
              <div className="text-center">
                <p
                  className="text-xs text-slate-900 font-semibold"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  I Speak
                </p>
                <p
                  className="text-xs font-light text-slate-800"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {getLanguages()}
                </p>
              </div>
            </div>

            {/* About Card - Compact */}
            <div className="bg-white/30 backdrop-blur-sm rounded-md p-0.5 border border-slate-200/30 hover:bg-white/50 transition-colors duration-300">
              <div className="text-center">
                <p
                  className="text-xs text-slate-900 font-semibold"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  About me
                </p>
                <p
                  className="text-xs text-slate-600 leading-tight font-light"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {getAbout()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="mt-auto pt-2 pb-2">
          <div className="flex flex-col space-y-1">
            {/* Chat Button */}
            <button
              onClick={() => onChat(ambassador)}
              className="w-full md:w-full font-bold py-2 md:py-2 px-2 rounded-lg flex items-center justify-center gap-1"
              style={{
                backgroundColor: customization.chatBackgroundColor || "#EF4444",
                color: customization.chatTextColor || "#FFFFFF",
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
              <span
                className="text-xs font-medium"
                style={{ fontFamily: "Inter, system-ui, sans-serif" }}
              >
                Chat
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AmbassadorCard
