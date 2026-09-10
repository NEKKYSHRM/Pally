"use client";

import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffdfb] text-[#202733]">
      {/* Background decorative shapes */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[230px] overflow-hidden">
        {/* Left peach hill */}
        <div className="absolute -left-20 bottom-[-80px] h-[240px] w-[310px] rounded-[50%] bg-[#ffe7d2]" />

        {/* Left green hill */}
        <div className="absolute -left-24 bottom-[-150px] h-[230px] w-[550px] rotate-[15deg] rounded-[50%] bg-[#cfe5b7]" />

        {/* Small left circle */}
        <div className="absolute bottom-[-5px] left-[150px] h-[110px] w-[110px] rounded-full bg-[#fff0e3] opacity-80" />

        {/* Right peach hill */}
        <div className="absolute -right-20 bottom-[-100px] h-[220px] w-[300px] rounded-[50%] bg-[#ffe9d7]" />

        {/* Right green hill */}
        <div className="absolute -right-24 bottom-[-150px] h-[250px] w-[550px] -rotate-[15deg] rounded-[50%] bg-[#cfe5b7]" />

        {/* Small right circle */}
        <div className="absolute bottom-[5px] right-[150px] h-[100px] w-[100px] rounded-full bg-[#fff0e3] opacity-80" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[940px] flex-col px-6 pb-10 pt-8 sm:px-10 md:px-16">
        {/* Header */}
        <header className="flex items-start justify-between">
          <div className="flex items-center">
            <span className="text-[34px] font-bold tracking-[-1.5px] text-[#202733] sm:text-[40px]">
              Pally
            </span>

            {/* Paw */}
            <span className="ml-1 -mt-1 text-[38px] leading-none">🐾</span>
          </div>

          <div className="hidden text-right text-[17px] font-medium leading-[1.35] tracking-wide text-[#7c8798] sm:block md:text-[20px]">
            <p>Little pets.</p>
            <p>Brighter friendships.</p>
          </div>
        </header>

        {/* Main content */}
        <section className="mx-auto flex w-full max-w-[680px] flex-1 flex-col items-center">
          {/* Heading */}
          <div className="mt-20 text-center sm:mt-24 md:mt-28">
            <h1 className="text-[42px] font-semibold leading-[1.15] tracking-[-1.8px] text-[#202733] sm:text-[52px] md:text-[58px]">
              Good friends
              <br />
              always find a way.
            </h1>

            <p className="mt-7 text-[19px] leading-relaxed text-[#7c8798] sm:text-[23px]">
              Let your pet keep the conversation alive.
            </p>
          </div>

          {/* Pet illustration */}
          <div className="relative mt-10 flex h-[250px] w-full items-end justify-center sm:mt-12 sm:h-[280px]">
            {/* Sprout */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2">
              <div className="relative h-[65px] w-[55px]">
                <div className="absolute left-1/2 top-[27px] h-[42px] w-[5px] -translate-x-1/2 rotate-[10deg] rounded-full bg-[#7da64d]" />

                <div className="absolute left-[8px] top-[2px] h-[30px] w-[19px] -rotate-[28deg] rounded-[100%_0_100%_0] bg-[#8dbd57]" />

                <div className="absolute right-[4px] top-[19px] h-[25px] w-[21px] rotate-[35deg] rounded-[0_100%_0_100%] bg-[#8dbd57]" />
              </div>
            </div>

            {/* Puppy body */}
            <div className="relative h-[205px] w-[300px] rounded-[46%_46%_20%_20%] bg-gradient-to-b from-[#fffaf0] to-[#f5ead9] shadow-[0_15px_35px_rgba(180,155,130,0.12)] sm:h-[225px] sm:w-[330px]">
              {/* Left ear */}
              <div className="absolute -left-[42px] top-[25px] h-[125px] w-[72px] rotate-[28deg] rounded-[55%_45%_45%_55%] bg-[#825136] sm:-left-[50px] sm:h-[140px] sm:w-[82px]" />

              {/* Right ear */}
              <div className="absolute -right-[42px] top-[25px] h-[125px] w-[72px] -rotate-[28deg] rounded-[45%_55%_55%_45%] bg-[#825136] sm:-right-[50px] sm:h-[140px] sm:w-[82px]" />

              {/* Eyebrows */}
              <div className="absolute left-[75px] top-[63px] h-[6px] w-[24px] rotate-[-10deg] rounded-full bg-[#e8d9c7]" />
              <div className="absolute right-[75px] top-[63px] h-[6px] w-[24px] rotate-[10deg] rounded-full bg-[#e8d9c7]" />

              {/* Blush */}
              <div className="absolute left-[47px] top-[88px] h-[34px] w-[38px] rounded-full bg-[#f5aaa3] opacity-70 blur-[8px]" />
              <div className="absolute right-[47px] top-[88px] h-[34px] w-[38px] rounded-full bg-[#f5aaa3] opacity-70 blur-[8px]" />

              {/* Closed eyes */}
              <div className="absolute left-[72px] top-[82px] h-[22px] w-[43px] rounded-t-full border-t-[7px] border-[#202733]" />
              <div className="absolute right-[72px] top-[82px] h-[22px] w-[43px] rounded-t-full border-t-[7px] border-[#202733]" />

              {/* Nose */}
              <div className="absolute left-1/2 top-[102px] h-[15px] w-[25px] -translate-x-1/2 rounded-[50%] bg-[#292a2c]" />

              {/* Mouth */}
              <div className="absolute left-1/2 top-[112px] h-[34px] w-[65px] -translate-x-1/2">
                <div className="absolute left-1/2 top-0 h-[19px] w-[32px] -translate-x-1/2 rounded-b-full border-b-[6px] border-[#292a2c]" />
                <div className="absolute left-[8px] top-[5px] h-[22px] w-[22px] rounded-bl-full border-b-[6px] border-l-[6px] border-[#292a2c]" />
                <div className="absolute right-[8px] top-[5px] h-[22px] w-[22px] rounded-br-full border-b-[6px] border-r-[6px] border-[#292a2c]" />
              </div>

              {/* Paws */}
              <div className="absolute -bottom-[12px] left-[24px] h-[55px] w-[72px] rounded-[50%] bg-[#fffaf0] shadow-[0_6px_12px_rgba(150,120,100,0.1)] sm:left-[32px] sm:h-[60px] sm:w-[80px]" />
              <div className="absolute -bottom-[12px] right-[24px] h-[55px] w-[72px] rounded-[50%] bg-[#fffaf0] shadow-[0_6px_12px_rgba(150,120,100,0.1)] sm:right-[32px] sm:h-[60px] sm:w-[80px]" />
            </div>

            {/* Heart speech bubble */}
            <div className="absolute right-[8%] top-[20px] flex h-[95px] w-[110px] items-center justify-center rounded-[50%] bg-[#fff7ef] sm:right-[5%] sm:h-[105px] sm:w-[125px]">
              <span className="text-[38px] text-[#f58483]">♥</span>

              <div className="absolute bottom-[1px] left-[8px] h-0 w-0 rotate-[12deg] border-l-[18px] border-t-[12px] border-l-transparent border-t-[#fff7ef]" />
            </div>
          </div>

          {/* Login options */}
          <div className="mt-5 w-full space-y-5 sm:mt-7 sm:space-y-6">
            {/* Google */}
            <GoogleLoginButton />

            {/* Apple */}
            <button
              type="button"
              className="flex h-[78px] w-full items-center justify-center gap-5 rounded-full border border-[#dedfe4] bg-white text-[20px] font-medium text-[#202733] shadow-sm transition hover:bg-[#fafafa] active:scale-[0.99] sm:text-[22px]"
            >
              <span className="text-[34px] leading-none">●</span>
              Continue with Apple
            </button>

            {/* Divider */}
            <div className="flex items-center gap-5 py-1">
              <div className="h-px flex-1 bg-[#d9dce1]" />
              <span className="text-[19px] text-[#8b95a5]">or</span>
              <div className="h-px flex-1 bg-[#d9dce1]" />
            </div>

            {/* Email */}
            <button
              type="button"
              disabled
              className="flex h-[78px] w-full cursor-not-allowed items-center justify-center gap-5 rounded-full border border-[#e2e3e7] bg-[#fafafa] text-[20px] font-medium text-[#a7afbc] sm:text-[22px]"
            >
              <svg
                width="31"
                height="25"
                viewBox="0 0 31 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1.5"
                  y="1.5"
                  width="28"
                  height="22"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <path
                  d="M3 4L15.5 14L28 4"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Continue with email
            </button>

            {/* Continue button */}
            <button
              type="button"
              className="flex h-[78px] w-full items-center justify-center gap-4 rounded-full bg-[#f58b8b] text-[22px] font-semibold text-white shadow-[0_8px_20px_rgba(245,139,139,0.2)] transition hover:bg-[#f27f80] active:scale-[0.99] sm:text-[24px]"
            >
              Continue
              <span className="text-[35px] font-light leading-none">→</span>
            </button>
          </div>

          {/* Terms */}
          <p className="mt-6 max-w-[600px] text-center text-[14px] leading-[1.55] text-[#7d8797] sm:text-[17px]">
            By continuing, you agree to our{" "}
            <span className="font-medium text-[#303846]">
              Terms of Service
            </span>
            <br className="sm:hidden" /> and{" "}
            <span className="font-medium text-[#303846]">
              Privacy Policy.
            </span>
          </p>

          {/* Bottom quote */}
          <div className="relative z-10 mb-2 mt-16 text-center sm:mt-20">
            <p className="font-serif text-[20px] italic leading-[1.45] text-[#ad9890] sm:text-[23px]">
              “Same friends.
              <br />
              New conversations.”
            </p>

            <div className="mt-5 text-[24px] opacity-70">🐾</div>
          </div>
        </section>
      </div>
    </main>
  );
}