"use client";

import GuestRoute from "@/app/components/GuestRoute";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

export default function LoginPage() {
  return (
    <GuestRoute>
      <main className="relative min-h-screen overflow-hidden bg-[#fffdfb] text-[#202733]">
        {/* =========================================================
          Background
      ========================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Left peach */}
          <div className="absolute -bottom-32 -left-32 h-64 w-[520px] rounded-[50%] bg-[#ffe7d2] sm:-bottom-40 sm:-left-40 sm:h-80 sm:w-[650px]" />

          {/* Left green */}
          <div className="absolute -bottom-40 -left-40 h-64 w-[650px] rotate-[10deg] rounded-[50%] bg-[#cfe5b7] sm:h-80 sm:w-[800px]" />

          {/* Left small circle */}
          <div className="absolute bottom-[-20px] left-[9%] h-24 w-24 rounded-full bg-[#fff0e3] opacity-80 sm:h-32 sm:w-32" />

          {/* Right peach */}
          <div className="absolute -bottom-36 -right-32 h-64 w-[520px] rounded-[50%] bg-[#ffe9d7] sm:-bottom-40 sm:-right-40 sm:h-80 sm:w-[650px]" />

          {/* Right green */}
          <div className="absolute -bottom-40 -right-40 h-64 w-[650px] -rotate-[10deg] rounded-[50%] bg-[#cfe5b7] sm:h-80 sm:w-[800px]" />

          {/* Right small circle */}
          <div className="absolute bottom-[-20px] right-[9%] h-24 w-24 rounded-full bg-[#fff0e3] opacity-80 sm:h-32 sm:w-32" />
        </div>

        {/* =========================================================
          Page wrapper
      ========================================================== */}

        <div className="relative z-10 flex min-h-screen w-full flex-col px-5 py-5 sm:px-8 sm:py-7 lg:h-screen lg:px-12 lg:py-6 xl:px-20">
          {/* =======================================================
            Header
        ======================================================== */}

          <header className="flex w-full items-start justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-[32px] font-bold tracking-[-1.5px] text-[#202733] sm:text-[38px] lg:text-[40px]">
                Pally
              </span>

              <span className="ml-1 -mt-1 text-[32px] leading-none sm:text-[38px]">
                🐾
              </span>
            </div>

            {/* Tagline */}
            <div className="text-right text-[14px] leading-[1.35] text-[#7c8798] sm:text-[17px] lg:text-[18px]">
              <p>Little pets.</p>
              <p>Brighter friendships.</p>
            </div>
          </header>

          {/* =======================================================
            Main
        ======================================================== */}

          <section className="mx-auto flex w-full flex-1 items-center justify-center">
            <div className="grid w-full max-w-[1500px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
              {/* ===================================================
                LEFT SIDE
            ==================================================== */}

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                {/* Heading */}
                <div>
                  <h1 className="text-[38px] font-semibold leading-[1.08] tracking-[-1.8px] text-[#202733] sm:text-[50px] lg:text-[54px] xl:text-[62px]">
                    Good friends
                    <br />
                    always find a way.
                  </h1>

                  <p className="mt-4 text-[17px] leading-relaxed text-[#7c8798] sm:text-[21px] lg:text-[20px] xl:text-[22px]">
                    Let your pet keep the conversation alive.
                  </p>
                </div>

                {/* =================================================
                  Puppy
              ================================================== */}

                <div className="relative mt-8 flex h-[240px] w-full max-w-[560px] items-end justify-center sm:mt-10 sm:h-[285px] lg:mt-8 lg:justify-start">
                  {/* Sprout */}
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 lg:left-[48%]">
                    <div className="relative h-[65px] w-[55px]">
                      <div className="absolute left-1/2 top-[27px] h-[42px] w-[5px] -translate-x-1/2 rotate-[10deg] rounded-full bg-[#7da64d]" />

                      <div className="absolute left-[8px] top-[2px] h-[30px] w-[19px] -rotate-[28deg] rounded-[100%_0_100%_0] bg-[#8dbd57]" />

                      <div className="absolute right-[4px] top-[19px] h-[25px] w-[21px] rotate-[35deg] rounded-[0_100%_0_100%] bg-[#8dbd57]" />
                    </div>
                  </div>

                  {/* Puppy body */}
                  <div className="relative h-[190px] w-[285px] rounded-[46%_46%_20%_20%] bg-gradient-to-b from-[#fffaf0] to-[#f5ead9] shadow-[0_18px_40px_rgba(180,155,130,0.12)] sm:h-[220px] sm:w-[330px] lg:h-[205px] lg:w-[310px]">
                    {/* Left ear */}
                    <div className="absolute -left-[42px] top-[23px] h-[120px] w-[70px] rotate-[28deg] rounded-[55%_45%_45%_55%] bg-[#825136] sm:-left-[48px] sm:h-[135px] sm:w-[78px]" />

                    {/* Right ear */}
                    <div className="absolute -right-[42px] top-[23px] h-[120px] w-[70px] -rotate-[28deg] rounded-[45%_55%_55%_45%] bg-[#825136] sm:-right-[48px] sm:h-[135px] sm:w-[78px]" />

                    {/* Eyebrows */}
                    <div className="absolute left-[70px] top-[60px] h-[5px] w-[23px] rotate-[-10deg] rounded-full bg-[#e8d9c7] sm:left-[80px] sm:top-[67px]" />

                    <div className="absolute right-[70px] top-[60px] h-[5px] w-[23px] rotate-[10deg] rounded-full bg-[#e8d9c7] sm:right-[80px] sm:top-[67px]" />

                    {/* Blush */}
                    <div className="absolute left-[45px] top-[82px] h-[32px] w-[37px] rounded-full bg-[#f5aaa3] opacity-70 blur-[8px] sm:left-[52px] sm:top-[92px]" />

                    <div className="absolute right-[45px] top-[82px] h-[32px] w-[37px] rounded-full bg-[#f5aaa3] opacity-70 blur-[8px] sm:right-[52px] sm:top-[92px]" />

                    {/* Eyes */}
                    <div className="absolute left-[68px] top-[76px] h-[21px] w-[42px] rounded-t-full border-t-[6px] border-[#202733] sm:left-[78px] sm:top-[84px]" />

                    <div className="absolute right-[68px] top-[76px] h-[21px] w-[42px] rounded-t-full border-t-[6px] border-[#202733] sm:right-[78px] sm:top-[84px]" />

                    {/* Nose */}
                    <div className="absolute left-1/2 top-[95px] h-[15px] w-[24px] -translate-x-1/2 rounded-[50%] bg-[#292a2c] sm:top-[106px]" />

                    {/* Mouth */}
                    <div className="absolute left-1/2 top-[105px] h-[35px] w-[65px] -translate-x-1/2 sm:top-[116px]">
                      <div className="absolute left-1/2 top-0 h-[20px] w-[32px] -translate-x-1/2 rounded-b-full border-b-[6px] border-[#292a2c]" />

                      <div className="absolute left-[8px] top-[5px] h-[22px] w-[22px] rounded-bl-full border-b-[6px] border-l-[6px] border-[#292a2c]" />

                      <div className="absolute right-[8px] top-[5px] h-[22px] w-[22px] rounded-br-full border-b-[6px] border-r-[6px] border-[#292a2c]" />
                    </div>

                    {/* Paws */}
                    <div className="absolute -bottom-[12px] left-[24px] h-[55px] w-[72px] rounded-[50%] bg-[#fffaf0] shadow-[0_6px_12px_rgba(150,120,100,0.1)] sm:left-[30px] sm:h-[62px] sm:w-[80px]" />

                    <div className="absolute -bottom-[12px] right-[24px] h-[55px] w-[72px] rounded-[50%] bg-[#fffaf0] shadow-[0_6px_12px_rgba(150,120,100,0.1)] sm:right-[30px] sm:h-[62px] sm:w-[80px]" />
                  </div>

                  {/* Heart */}
                  <div className="absolute right-[8%] top-[20px] flex h-[85px] w-[100px] items-center justify-center rounded-[50%] bg-[#fff7ef] sm:right-[8%] sm:h-[105px] sm:w-[120px] lg:right-[0]">
                    <span className="text-[34px] text-[#f58483]">♥</span>

                    <div className="absolute bottom-[0] left-[8px] h-0 w-0 rotate-[12deg] border-l-[18px] border-t-[12px] border-l-transparent border-t-[#fff7ef]" />
                  </div>
                </div>
              </div>

              {/* ===================================================
                RIGHT SIDE
            ==================================================== */}

              <div className="flex w-full flex-col items-center lg:items-start">
                <div className="w-full max-w-[560px]">
                  {/* Login heading */}
                  <div className="mb-6 text-center lg:text-left">
                    <p className="text-[14px] font-medium uppercase tracking-[2px] text-[#a28f87]">
                      Welcome to Pally
                    </p>

                    <h2 className="mt-2 text-[30px] font-semibold tracking-[-1px] text-[#202733] sm:text-[36px]">
                      Keep the friendship going.
                    </h2>

                    <p className="mt-2 text-[16px] leading-relaxed text-[#7c8798] sm:text-[18px]">
                      Sign in and let your little pet start the conversation.
                    </p>
                  </div>

                  {/* Google Login */}
                  <div className="w-full">
                    <GoogleLoginButton />
                  </div>

                  {/* Terms */}
                  <p className="mt-5 text-center text-[12px] leading-[1.5] text-[#7d8797] lg:text-left">
                    By continuing, you agree to our{" "}
                    <span className="font-medium text-[#303846]">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="font-medium text-[#303846]">
                      Privacy Policy
                    </span>
                    .
                  </p>

                  {/* Quote */}
                  <div className="mt-10 hidden text-center lg:block lg:text-left">
                    <p className="font-serif text-[19px] italic leading-[1.4] text-[#ad9890]">
                      “Same friends.
                      <br />
                      New conversations.”
                    </p>

                    <div className="mt-3 text-[20px] opacity-70">🐾</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mobile quote */}
          <div className="relative z-10 mt-8 pb-2 text-center lg:hidden">
            <p className="font-serif text-[17px] italic leading-[1.35] text-[#ad9890]">
              “Same friends.
              <br />
              New conversations.”
            </p>

            <div className="mt-2 text-[20px] opacity-70">🐾</div>
          </div>
        </div>
      </main>
    </GuestRoute>
  );
}
