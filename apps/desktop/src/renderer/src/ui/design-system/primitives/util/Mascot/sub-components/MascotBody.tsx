type Props = {
  /** Matches the prefix used by {@link MascotDefs} so url(#…) references resolve. */
  uid: string
}

/** The scanner-sprite creature only — no background aura and no scan beam. */
const MascotBody = ({ uid }: Props) => (
  <g className="mascot__body" filter={`url(#${uid}-shadow)`}>
    {/* back fins */}
    <path d="M158 226 C104 218 78 235 62 260 C105 275 144 266 173 239 Z" fill={`url(#${uid}-finGrad)`} opacity=".88" />
    <path d="M151 285 C107 302 92 328 92 355 C134 352 166 330 180 293 Z" fill={`url(#${uid}-finGrad)`} opacity=".78" />
    <path d="M348 225 C397 210 424 223 446 246 C407 268 374 263 341 238 Z" fill={`url(#${uid}-finGrad)`} opacity=".70" />

    {/* antennae */}
    <path d="M202 130 C187 93 170 73 145 61 C139 91 151 125 190 155 Z" fill={`url(#${uid}-finGrad)`} stroke="#9cc9ff" strokeOpacity=".45" strokeWidth="2" />
    <path d="M306 124 C318 85 338 66 361 55 C369 89 357 122 319 153 Z" fill={`url(#${uid}-finGrad)`} stroke="#9cc9ff" strokeOpacity=".45" strokeWidth="2" />

    {/* outer rim */}
    <ellipse cx="256" cy="230" rx="126" ry="118" fill="none" stroke={`url(#${uid}-shellRim)`} strokeWidth="7" opacity=".74" filter={`url(#${uid}-softGlow)`} />

    {/* shell */}
    <path
      d="M256 112 C323 112 377 159 384 224 C391 291 335 348 256 348 C176 348 121 292 128 224 C135 159 190 112 256 112 Z"
      fill={`url(#${uid}-shell)`}
    />

    {/* shell highlights */}
    <path d="M174 164 C204 134 248 126 292 134" fill="none" stroke="#b7e7ff" strokeWidth="6" strokeLinecap="round" opacity=".26" />
    <path d="M144 234 C145 178 191 137 248 132" fill="none" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" opacity=".26" />

    {/* face screen */}
    <rect x="154" y="162" width="204" height="134" rx="61" fill="#050914" />
    <rect x="164" y="172" width="184" height="114" rx="52" fill="#07101f" stroke="#214f84" strokeWidth="3" />

    {/* face glass shine */}
    <g clipPath={`url(#${uid}-faceClip)`} opacity=".28">
      <path d="M177 180 C226 162 284 165 336 190" fill="none" stroke="#7dd3fc" strokeWidth="12" strokeLinecap="round" />
    </g>

    {/* eyes */}
    <g filter={`url(#${uid}-softGlow)`}>
      <rect className="mascot__eye" x="204" y="211" width="25" height="55" rx="13" fill="#67e8f9" />
      <rect className="mascot__eye" x="283" y="211" width="25" height="55" rx="13" fill="#67e8f9" />
    </g>

    {/* side caps */}
    <circle cx="140" cy="249" r="18" fill="#111a31" stroke="#3867ff" strokeOpacity=".5" strokeWidth="3" />
    <circle cx="372" cy="249" r="18" fill="#111a31" stroke="#8b5cf6" strokeOpacity=".5" strokeWidth="3" />

    {/* feet / thrusters */}
    <path d="M206 337 C196 356 201 371 219 374 C237 370 236 350 226 337 Z" fill="#0b1020" />
    <path d="M286 337 C276 356 281 371 299 374 C317 370 316 350 306 337 Z" fill="#0b1020" />

    {/* pixel particles */}
    <g fill="#60a5fa" filter={`url(#${uid}-softGlow)`}>
      <rect className="mascot__pixel mascot__pixel--a" x="392" y="178" width="12" height="12" rx="2" opacity=".9" />
      <rect className="mascot__pixel mascot__pixel--b" x="411" y="217" width="9" height="9" rx="2" opacity=".75" />
      <rect className="mascot__pixel mascot__pixel--c" x="388" y="289" width="15" height="15" rx="3" opacity=".65" />
      <rect className="mascot__pixel mascot__pixel--d" x="101" y="192" width="10" height="10" rx="2" opacity=".58" />
    </g>

    {/* sleep cue — hidden unless the sleeping state reveals it (see Mascot.css) */}
    <g className="mascot__zzz" fill="#9be3ff" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight="700" fontStyle="italic">
      <text className="mascot__z mascot__z--1" x="330" y="150" fontSize="26">z</text>
      <text className="mascot__z mascot__z--2" x="352" y="120" fontSize="34">z</text>
      <text className="mascot__z mascot__z--3" x="378" y="86" fontSize="46">z</text>
    </g>
  </g>
)

export { MascotBody }
