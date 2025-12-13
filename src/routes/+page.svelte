<script lang="ts">
  import { goto, preloadCode } from '$app/navigation'
  import { fadeIn, parallax, staggerChildren } from '$lib/animations/motion'
  import { neuralGrid } from '$lib/animations/neuralGrid'
  import Header from '$lib/components/Header.svelte'
  import ArrowRightUpLine from '$lib/icons/arrow-right-up-line.svelte'
  import MenuFill from '$lib/icons/menu-fill.svelte'
  import MenuUnfoldLine from '$lib/icons/menu-unfold-line.svelte'
  import PrimaryButton from '$lib/ui/PrimaryButton.svelte'
  import { onMount } from 'svelte'

  const navLinks = [
    { label: 'App', href: '#app' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Merchants', href: '#merchants' },
    { label: 'Token', href: '#tokenomics' },
    { label: 'Contact', href: '#contact' }
  ]

  const heroChecklist = [
    'Pay per article, per minute, or per request',
    'No monthly subscriptions or credit card forms',
    'One secure wallet for the entire web'
  ]

  const userBenefits = [
    {
      title: 'Freedom from Subscriptions',
      description:
        'Why pay $15/month when you only want to read one article? With 1Pay.ing, you pay pennies for exactly what you consume. No waste, no commitments.'
    },
    {
      title: 'One Wallet, Zero Friction',
      description:
        'Forget creating accounts and entering credit card details for every site. Your 1Pay.ing wallet is your universal pass to the premium web.'
    },
    {
      title: 'Global & Private',
      description:
        "Works anywhere in the world. You don't need a bank account, just an internet connection. You control your data and your funds."
    },
    {
      title: 'Fair for Everyone',
      description:
        'Creators get paid instantly for their work. You pay less by only buying what you need. We removed the middlemen and the fees.'
    }
  ]

  const howItWorks = [
    {
      title: '1. Discover',
      description:
        'Find premium content, AI tools, or APIs you want to use. Look for the "Pay with 1Pay.ing" option.'
    },
    {
      title: '2. One-Click Pay',
      description:
        'No login forms. The 1Pay.ing wallet pops up with the exact price (e.g., $0.02). Just tap "Approve".'
    },
    {
      title: '3. Instant Access',
      description:
        "The payment settles in milliseconds. Your content unlocks immediately. It's faster than loading a credit card page."
    }
  ]

  const codeSample = `
<pre style="font-family:monospace;color: rgb(201, 209, 217); background-color: rgb(13, 17, 23); font-weight: 400; "><span style="color: rgb(255, 123, 114); font-weight: 400;">import</span> { payingKit } <span style="color: rgb(255, 123, 114); font-weight: 400;">from</span> <span style="color: rgb(165, 214, 255); font-weight: 400;">'@ldclabs/1paying-kit'</span>

<span style="color: rgb(139, 148, 158); font-weight: 400;">// 1. Check if the resource requires payment</span>
<span style="color: rgb(255, 123, 114); font-weight: 400;">const</span> { payUrl, txid } = <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> payingKit.<span style="color: rgb(210, 168, 255); font-weight: 400;">tryGetPayUrl</span>(response)

<span style="color: rgb(255, 123, 114); font-weight: 400;">if</span> (payUrl) {
  <span style="color: rgb(139, 148, 158); font-weight: 400;">// 2. Redirect user to 1Pay.ing to sign</span>
  <span style="color: rgb(255, 123, 114); font-weight: 400;">window</span>.<span style="color: rgb(210, 168, 255); font-weight: 400;">open</span>(payUrl, <span style="color: rgb(165, 214, 255); font-weight: 400;">'1Pay.ing'</span>)

  <span style="color: rgb(139, 148, 158); font-weight: 400;">// 3. Wait for payment proof</span>
  <span style="color: rgb(255, 123, 114); font-weight: 400;">const</span> proof = <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> payingKit.<span style="color: rgb(210, 168, 255); font-weight: 400;">waitForPaymentPayload</span>(txid)

  <span style="color: rgb(139, 148, 158); font-weight: 400;">// 4. Retry request with proof</span>
  <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> <span style="color: rgb(210, 168, 255); font-weight: 400;">fetch</span>(url, { <span style="color: rgb(121, 192, 255); font-weight: 400;">headers</span>: { <span style="color: rgb(165, 214, 255); font-weight: 400;">'PAYMENT-SIGNATURE'</span>: proof } })
}</pre>
`

  const developerHighlights = [
    {
      badge: 'Easy',
      title: 'Drop-in Monetization',
      description:
        "Add a revenue stream to your API, blog, or app in minutes. Our SDK handles the complex crypto parts so you don't have to."
    },
    {
      badge: 'Universal',
      title: 'Any Wallet, Any Chain',
      description:
        'Your users can pay with their favorite wallets (Phantom, MetaMask, etc.). We handle the compatibility.'
    },
    {
      badge: 'Secure',
      title: 'Non-Custodial',
      description:
        'We never hold your funds. Payments go directly from the user to you (or your smart contract). Secure by design.'
    },
    {
      badge: 'Flexible',
      title: 'Micro to Macro',
      description:
        'Charge $0.001 per API call or $100 for a digital asset. The protocol supports any amount with near-zero fees.'
    },
    {
      badge: 'Identity',
      title: 'Web2 Friendly',
      description:
        'Keep your existing user accounts. 1Pay.ing simply attaches a payment proof to their requests.'
    },
    {
      badge: 'Growth',
      title: 'Better Conversion',
      description:
        'Users are more likely to pay $0.50 once than subscribe for $10/month. Lower the barrier to entry and increase your revenue.'
    }
  ]

  const tokenFlywheels = [
    {
      title: 'Earn by Integrating',
      description:
        'Merchants and creators who add 1Pay.ing to their apps earn rewards for every transaction they facilitate. The more you build, the more you earn.'
    },
    {
      title: 'Earn by Spending',
      description:
        'Users get "cashback" in PAY tokens for using the network. It pays to be an active part of the ecosystem.'
    }
  ]

  const tokenUtilities = [
    {
      badge: 'Merchants',
      title: 'For Merchants',
      points: [
        'Earn Rewards: Get extra PAY tokens automatically for every payment you process.',
        'Premium Features: Stake PAY to access advanced analytics and gas sponsorship for your users.'
      ]
    },
    {
      badge: 'Users',
      title: 'For Everyone',
      points: [
        'Pay-to-Earn: Receive PAY rebates on your transaction fees.',
        'Governance: Have a say in how the platform evolves and where the treasury funds go.'
      ]
    },
    {
      badge: 'Ecosystem',
      title: 'Shared Success',
      points: [
        'The token aligns incentives between those who build the tools and those who use them.',
        'A portion of fees buys back and burns PAY, making the token scarcer over time.'
      ]
    }
  ]

  const tokenAllocations = [
    {
      label: 'Community Rewards',
      value: '40% • 400M PAY',
      percentage: 40,
      description:
        'Incentives for merchants and users to grow the network (Earn by Integrating & Pay-to-Earn).'
    },
    {
      label: 'Public Sale & Liquidity',
      value: '20% • 200M PAY',
      percentage: 20,
      description:
        'Ensuring there is enough liquidity for everyone to buy and sell PAY easily.'
    },
    {
      label: 'Core Team',
      value: '18% • 180M PAY',
      percentage: 18,
      description:
        'Vested over 3 years to ensure the team is committed to long-term success.'
    },
    {
      label: 'Partners & Advisors',
      value: '12% • 120M PAY',
      percentage: 12,
      description: 'For strategic partners who help us expand into new markets.'
    },
    {
      label: 'Treasury',
      value: '10% • 100M PAY',
      percentage: 10,
      description:
        'Funds for operations, marketing, and legal to keep the platform running smoothly.'
    }
  ]

  const tokenAllocationTotal = {
    label: 'Total Supply',
    value: '1B PAY',
    description:
      'Fixed supply. No inflation. Designed to power the value-native economy.'
  }

  const tokenAllocationPalette = [
    '#0ea5e9',
    '#6366f1',
    '#38bdf8',
    '#a855f7',
    '#f97316'
  ]
  const tokenAllocationChartCenter = 100
  const tokenAllocationChartRadius = 90
  const tokenAllocationChartInnerRadius = 55

  function polarToCartesian(
    cx: number,
    cy: number,
    radius: number,
    angle: number
  ) {
    const radians = ((angle - 90) * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians)
    }
  }

  function describeArc(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) {
    const start = polarToCartesian(cx, cy, radius, startAngle)
    const end = polarToCartesian(cx, cy, radius, endAngle)
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
  }

  const tokenAllocationSlices = (() => {
    const total = tokenAllocations.reduce(
      (sum, allocation) => sum + allocation.percentage,
      0
    )
    let cumulative = 0

    return tokenAllocations.map((allocation, index) => {
      const startAngle = (cumulative / total) * 360
      cumulative += allocation.percentage
      const endAngle = (cumulative / total) * 360

      return {
        ...allocation,
        color: tokenAllocationPalette[index % tokenAllocationPalette.length],
        path: describeArc(
          tokenAllocationChartCenter,
          tokenAllocationChartCenter,
          tokenAllocationChartRadius,
          startAngle,
          endAngle
        )
      }
    })
  })()

  const tokenLaunchPlan = [
    {
      title: 'Fair Launch',
      description:
        'We are launching with a Liquidity Bootstrapping Pool (LBP) to ensure fair price discovery for everyone.'
    },
    {
      title: 'Locked Liquidity',
      description:
        'We are locking the initial liquidity for 36 months to demonstrate our long-term commitment.'
    }
  ]

  const tokenFlywheelLoop = [
    'Adoption: Merchants integrate 1Pay.ing to monetize their apps.',
    'Usage: Users pay for content/services using the 1Pay.ing wallet.',
    'Rewards: Both merchants and users earn PAY tokens for transacting.',
    'Growth: More users attract more merchants, creating a positive loop.',
    'Value: Increased network activity drives demand for the PAY token.'
  ]

  const footerColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Docs', href: 'https://github.com/ldclabs/1paying-kit' },
        { label: 'GitHub', href: 'https://github.com/ldclabs/1paying' }
      ]
    },
    {
      title: 'Community',
      links: [
        {
          label: 'X (Twitter)',
          href: 'https://x.com/i/communities/1988555176517513709'
        }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: 'https://x.com/1Paying' },
        { label: 'Contact', href: 'mailto:hi@1pay.ing' }
      ]
    }
  ]

  let mobileNavOpen = $state(false)
  let isLoadingApp = $state(false)

  onMount(() => {
    preloadCode('/app').catch(() => {
      /* ignore */
    })
  })

  function launchApp() {
    if (isLoadingApp) return
    isLoadingApp = true
    goto('/app')
  }
</script>

<div class="flex min-h-screen flex-col bg-white text-slate-900">
  <Header>
    <button
      type="button"
      class="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold text-slate-600 sm:hidden"
      onclick={() => (mobileNavOpen = !mobileNavOpen)}
      aria-controls="primary-navigation"
      aria-expanded={mobileNavOpen}
    >
      <span>
        {#if mobileNavOpen}
          <MenuUnfoldLine />
        {:else}
          <MenuFill />
        {/if}
      </span>
    </button>
    <nav
      id="primary-navigation"
      class={`w-full flex-col gap-6 text-sm font-medium text-slate-600 ${mobileNavOpen ? 'mb-2 flex' : 'hidden'} sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-6`}
    >
      {#each navLinks as link}
        <a
          class="transition hover:text-slate-900"
          href={link.href}
          onclick={() => (mobileNavOpen = false)}
        >
          {link.label}
        </a>
      {/each}
      <a
        class="rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
        href="https://github.com/ldclabs/1paying-kit"
        target="1PayingKit"
        onclick={() => (mobileNavOpen = false)}
      >
        Get Started
      </a>
    </nav>
  </Header>

  <main class="max-w-full flex-1">
    <section
      id="app"
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-[calc(100vh-80px)] overflow-hidden lg:max-h-384"
    >
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_60%)]"
      ></div>
      <div
        use:parallax={{ speed: 0.18 }}
        class="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-8 lg:flex-row lg:items-center lg:py-24"
      >
        <div use:fadeIn class="max-w-2xl space-y-6">
          <span
            class="inline-flex items-center rounded-full border border-slate-100 bg-sky-50 px-4 py-1 text-xs font-semibold tracking-[0.4em] text-sky-600 uppercase"
          >
            The Future of Payments
          </span>
          <h1
            class="font-outfit text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Unlock the Web, <br /> One Cent at a Time.
          </h1>
          <p class="text-lg text-slate-600 sm:text-xl">
            <span class="font-outfit font-bold text-black">1Pay.ing</span> is the
            universal wallet for the new economy. Pay $0.01 for an article or $0.05
            for an AI image. No subscriptions. No sign-ups. Just instant access.
          </p>

          <ul class="grid text-sm text-slate-600">
            {#each heroChecklist as item}
              <li class="flex items-center gap-2 rounded-sm px-4 py-2">
                <span
                  class="size-3 flex-none rounded-full bg-sky-500 inset-shadow-sm inset-shadow-indigo-500"
                ></span>
                <span>{item}</span>
              </li>
            {/each}
          </ul>
        </div>
        <div
          use:fadeIn={{ delay: 200 }}
          class="w-full max-w-md self-center rounded-sm border border-slate-100 bg-white/90 p-8 shadow-2xl shadow-sky-500/15 backdrop-blur lg:max-w-lg"
        >
          <div
            class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <h2
              class="text-base font-semibold tracking-[0.4em] text-slate-600 uppercase"
            >
              Try It Now
            </h2>
            <PrimaryButton
              onclick={launchApp}
              isLoading={isLoadingApp}
              class="bg-green-100! px-4! py-2! font-semibold"
            >
              <span class="text-sm text-sky-600">Launch Wallet</span>
            </PrimaryButton>
          </div>
          <p class="mt-4 text-sm text-slate-600">
            Experience the friction-free web. Connect your wallet once, and pay
            for content across the internet with a single tap.
          </p>
          <div class="mt-6 space-y-4 text-sm text-slate-600">
            <div
              class="rounded-sm border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5"
            >
              <h3 class="text-sm font-semibold text-slate-900"
                >Imagine a web where you can:</h3
              >
              <ul class="mt-3 space-y-2">
                <li class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span>Read a premium article for $0.10</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span>Generate an AI image for $0.05</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span>Watch a video ad-free for $0.02</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="mt-6 grid gap-4">
            <div
              class="rounded-sm border border-slate-100 bg-slate-50 p-4 text-left shadow-sm shadow-slate-900/5"
            >
              <h3
                class="text-sm font-semibold tracking-[0.3em] text-sky-600 uppercase"
              >
                Live Demo
              </h3>
              <p class="mt-3 text-sm text-slate-600">
                See how fast it is. Buy us a virtual coffee using 1Pay.ing
                micropayments.
              </p>
              <div
                class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <span
                  class="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase"
                >
                  Powered by 1Pay.ing
                </span>
                <a
                  class="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
                  href="https://1paying-coffee.zensh.workers.dev/"
                  target="1PayingCoffeeDemo"
                >
                  Buy Coffee Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      id="benefits"
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-screen border-y border-slate-100 bg-sky-50 py-8 lg:max-h-384 lg:py-24"
    >
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn>
          <p
            class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
            >Why 1Pay.ing?</p
          >
          <h2
            class="mt-6 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            The web was broken. We fixed it.
          </h2>
          <p class="mt-6 max-w-2xl text-base text-slate-600">
            Subscriptions are expensive. Ads are annoying.
            <span class="font-outfit font-bold text-black">1Pay.ing</span> brings
            back the original vision of the internet: a place where value flows freely
            between creators and users.
          </p>
        </div>
        <div use:staggerChildren class="mt-12 grid gap-4 md:grid-cols-2">
          {#each userBenefits as benefit}
            <article
              class="rounded-sm border border-slate-100 bg-white p-8 shadow-lg shadow-slate-900/5"
            >
              <h3 class="text-xl font-semibold">{benefit.title}</h3>
              <p class="mt-4 text-sm text-slate-600">{benefit.description}</p>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <section
      id="merchants"
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-screen py-8 lg:max-h-384 lg:py-24"
    >
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn>
          <p
            class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
            >For Merchants & Creators</p
          >
          <h2
            class="mt-6 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Monetize anything in minutes.
          </h2>
          <p class="mt-6 max-w-3xl text-base text-slate-600">
            Stop losing revenue to complex subscriptions. With <span
              class="font-outfit font-bold text-black">1Pay.ing</span
            >, you can monetize any content, tool, or service instantly. Simple
            for you, seamless for your users.
          </p>
        </div>
        <div class="mt-12 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div use:staggerChildren>
            <h3
              class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
              >Your Customer's Journey</h3
            >
            <ol class="mt-6 space-y-4">
              {#each howItWorks as step, index}
                <li
                  class="flex gap-4 rounded-sm border border-slate-100 bg-white p-4 shadow-lg shadow-slate-900/5"
                >
                  <span class="mt-1 text-sm font-semibold text-sky-600"
                    >0{index + 1}</span
                  >
                  <div>
                    <h4 class="text-lg font-semibold">{step.title}</h4>
                    <p class="mt-2 text-sm text-slate-600">{step.description}</p
                    >
                  </div>
                </li>
              {/each}
            </ol>
          </div>
          <div
            use:fadeIn={{ delay: 300 }}
            class="flex min-w-0 flex-col rounded-sm border border-slate-100 bg-white p-6 shadow-2xl shadow-sky-500/10"
          >
            <div
              class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
              >Integration Example</div
            >
            <p class="mt-4 text-sm text-slate-600">
              Works with your existing website or app. Just a few lines of code
              to start accepting payments.
            </p>
            <div class="mt-4 overflow-x-auto rounded-md bg-black p-4">
              {@html codeSample}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-screen bg-sky-50 py-8 lg:max-h-384 lg:py-24"
    >
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn>
          <p
            class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
            >Platform Features</p
          >
          <h2
            class="mt-6 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Everything you need to build a paid service.
          </h2>
        </div>
        <div use:staggerChildren class="mt-12 grid gap-4 sm:grid-cols-2">
          {#each developerHighlights as feature}
            <article
              class="rounded-sm border border-slate-100 bg-white p-8 shadow-xl shadow-slate-900/10"
            >
              <div class="flex items-center justify-between">
                <h3 class=" text-xl font-semibold">{feature.title}</h3>
                <span
                  class="rounded-full border border-slate-100 bg-sky-50 px-3 py-1 text-[10px] font-semibold tracking-[0.4em] text-sky-600 uppercase"
                >
                  {feature.badge}
                </span>
              </div>
              <p class="mt-4 text-sm text-slate-600">{feature.description}</p>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <section
      id="tokenomics"
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-screen overflow-hidden py-8 lg:max-h-400 lg:py-24"
    >
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.12),transparent_70%)]"
      ></div>
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn>
          <p
            class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
            >The PAY Token</p
          >
          <h2
            class="mt-6 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            The fuel for the new economy.
          </h2>
          <p class="mt-6 max-w-3xl text-base text-slate-600">
            <span class="font-outfit font-bold text-black">PAY</span> (<a
              href="https://solscan.io/token/PAYiNGqaLFRdBomkQY3JXZeCm7wzK7hKuhrJDzcZBWN"
              target="1PayingToken"
              class="inline-flex flex-row items-center align-middle text-xs hover:text-sky-500"
            >
              <img
                src="/_assets/images/sol.webp"
                alt="Solana"
                class="mr-1 inline-block size-4 rounded-full align-middle"
              />
              <span>PAYiNG...ZBWN</span>
              <span class="*:size-4"><ArrowRightUpLine /></span>
            </a>) is the utility token that powers
            <span class="font-outfit font-bold text-black">1Pay.ing</span>. It
            aligns the interests of users, developers, and the platform itself.
          </p>
        </div>
        <div use:staggerChildren class="mt-12 grid gap-4 md:grid-cols-2">
          {#each tokenFlywheels as flywheel}
            <article
              class="rounded-sm border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-900/10"
            >
              <h3 class="text-xl font-semibold">{flywheel.title}</h3>
              <p class="mt-4 text-sm text-slate-600">{flywheel.description}</p>
            </article>
          {/each}
        </div>

        <div class="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div
            use:fadeIn={{ delay: 100 }}
            class="flex flex-col items-center justify-center rounded-sm border border-slate-100 bg-slate-50 p-8 shadow-inner shadow-slate-900/10"
          >
            <div class="relative w-full max-w-xs">
              <svg
                viewBox="0 0 200 200"
                role="img"
                aria-label="PAY token allocation pie chart"
                class="h-auto w-full"
              >
                {#each tokenAllocationSlices as slice}
                  <path
                    d={slice.path}
                    fill={slice.color}
                    stroke="white"
                    stroke-width="1"
                    class="allocation-slice"
                  />
                {/each}
                <circle
                  cx={tokenAllocationChartCenter}
                  cy={tokenAllocationChartCenter}
                  r={tokenAllocationChartInnerRadius}
                  fill="white"
                />
                <text
                  x={tokenAllocationChartCenter}
                  y={tokenAllocationChartCenter - 6}
                  text-anchor="middle"
                  class="fill-slate-900 text-sm font-semibold"
                >
                  {tokenAllocationTotal.label}
                </text>
                <text
                  x={tokenAllocationChartCenter}
                  y={tokenAllocationChartCenter + 12}
                  text-anchor="middle"
                  class="fill-slate-500 text-xs"
                >
                  {tokenAllocationTotal.value}
                </text>
              </svg>
            </div>
            <p class="mt-4 max-w-sm text-center text-xs text-slate-500">
              {tokenAllocationTotal.description}
            </p>
            <ul class="mt-6 w-full space-y-4">
              {#each tokenAllocationSlices as slice}
                <li class="flex gap-3 text-sm text-slate-600">
                  <span
                    class="mt-1 h-3 w-3 flex-none rounded-full"
                    style={`background-color: ${slice.color};`}
                  ></span>
                  <div>
                    <p class="font-semibold text-slate-900">{slice.label}</p>
                    <p class="text-xs text-slate-500">{slice.value}</p>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
          <div
            use:staggerChildren
            class="grid grid-cols-1 gap-4 rounded-sm border border-slate-100 bg-slate-50 p-8 shadow-inner"
          >
            {#each tokenUtilities as utility}
              <article class="">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-semibold">{utility.title}</h3>
                  <span
                    class="rounded-full border border-slate-100 bg-sky-50 px-3 py-1 text-[10px] font-semibold tracking-[0.4em] text-sky-600 uppercase"
                  >
                    {utility.badge}
                  </span>
                </div>
                <ul class="mt-4 space-y-3 text-sm text-slate-600">
                  {#each utility.points as point}
                    <li class="flex items-start gap-2">
                      <span class="mt-1 h-2 w-2 rounded-full bg-sky-500"></span>
                      <span>{point}</span>
                    </li>
                  {/each}
                </ul>
              </article>
            {/each}
            {#each tokenLaunchPlan as item}
              <article class="">
                <h3 class="text-xl font-semibold text-slate-900"
                  >{item.title}</h3
                >
                <p class="mt-4 text-sm text-slate-600">{item.description}</p>
              </article>
            {/each}
          </div>
        </div>

        <div class="mt-8">
          <article
            class="rounded-sm border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-900/10"
          >
            <h3 class="text-2xl font-semibold text-slate-900">
              The Growth Cycle
            </h3>
            <ol class="mt-4 space-y-3 text-sm text-slate-600">
              {#each tokenFlywheelLoop as step, index}
                <li class="flex items-center gap-2">
                  <span
                    class="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white"
                  >
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              {/each}
            </ol>
          </article>
        </div>
      </div>
    </section>

    <section id="contact" class="mt-12 bg-sky-50 py-8 lg:mt-24 lg:py-24">
      <div class="mx-auto max-w-5xl px-6">
        <div
          use:fadeIn
          class="rounded-md border border-slate-100 bg-linear-to-r from-sky-100 via-blue-50 to-purple-100 p-12 text-center shadow-2xl shadow-slate-900/5"
        >
          <p
            class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
            >Join the Revolution</p
          >
          <h2 class="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to experience the future of payments?
          </h2>
          <p class="mt-6 text-base text-slate-600">
            Whether you are a user, a creator, or a developer, there is a place
            for you in the 1Pay.ing ecosystem.
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              class="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              href="https://github.com/ldclabs/1paying-kit"
              target="1PayingKit"
            >
              Start Building
            </a>
            <a
              class="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-white/70"
              href="https://x.com/1Paying"
              target="1PayingCommunity"
            >
              Join Community
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer use:fadeIn class="border-t border-slate-100 bg-slate-50 py-8">
    <div class="mx-auto max-w-6xl px-6">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {#each footerColumns as column}
          <div>
            <h3
              class="text-sm font-semibold tracking-[0.4em] text-slate-600 uppercase"
              >{column.title}</h3
            >
            <ul class="mt-4 space-y-3 text-sm text-slate-600">
              {#each column.links as link}
                <li>
                  <a
                    class="transition hover:text-slate-900"
                    href={link.href}
                    target={'View' + link.label}>{link.label}</a
                  >
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
      <div
        class="mt-12 flex flex-col gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="space-y-1">
          <p>
            © {new Date().getFullYear()}
            <span class="font-outfit font-bold text-black">1Pay.ing</span>. All
            rights reserved.
          </p>
          <p>
            1Pay.ing App is open source on
            <a
              href="https://github.com/ldclabs/1paying"
              target="1PayingGithub"
              class="font-medium text-sky-600 hover:text-sky-500"
            >
              GitHub
            </a>
            .
          </p>
        </div>
        <div class="space-y-1 text-right sm:text-left">
          <a class="block hover:text-slate-900" href="mailto:team@1pay.ing"
            >hi@1pay.ing</a
          >
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  .allocation-slice {
    cursor: pointer;
    transform-box: fill-box;
    transform-origin: center;
    transition:
      transform 180ms ease,
      filter 180ms ease;
  }

  .allocation-slice:hover {
    transform: scale(1.05);
    filter: brightness(1.12);
  }
</style>
