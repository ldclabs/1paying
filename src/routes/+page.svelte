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
    { label: 'Why x402', href: '#benefits' },
    { label: 'Developers', href: '#developers' },
    { label: 'Tokenomics', href: '#tokenomics' },
    { label: 'Contact', href: '#contact' }
  ]

  const heroChecklist = [
    'Your single wallet for the entire x402 economy',
    'Human-readable intents, one-tap approvals',
    'Seamlessly bridge Web2 accounts with Web3 wallets'
  ]

  const userBenefits = [
    {
      title: 'True Micropayments',
      description:
        'Pay as little as $0.001 with near-zero fees. Unlock per-article content, per-call APIs, or per-token AI services. Value finally matches consumption.'
    },
    {
      title: 'Flow, Not Friction',
      description:
        'Verify once, consume instantly. x402 settles in the background, so you skip wait times and stay in the moment.'
    },
    {
      title: 'Global & Permissionless',
      description:
        'Wherever the internet goes, 1Pay.ing follows. All you need is a wallet—no banks, no borders, no gatekeepers.'
    },
    {
      title: 'Trust by Design',
      description:
        'Open protocols, transparent signing, and a checkout flow you can actually read. You control your keys; we just deliver the intent.'
    }
  ]

  const howItWorks = [
    {
      title: 'Generate Pay URL',
      description:
        'When your API returns HTTP 402, pass the response to payingKit.tryGetPayUrl(). We generate a secure, verifiable checkout link.'
    },
    {
      title: 'User Signs',
      description:
        'Route users to 1Pay.ing. We handle wallet discovery and present a clear, human-readable signature request. No more confusing JSON content.'
    },
    {
      title: 'Resume Instantly',
      description:
        'payingKit.waitForPaymentPayload() resolves with the signed proof. Retry your protected resource with the X-PAYMENT header and deliver value.'
    }
  ]

  const codeSample = `
<pre style="font-family:monospace;color: rgb(201, 209, 217); background-color: rgb(13, 17, 23); font-weight: 400; "><span style="color: rgb(255, 123, 114); font-weight: 400;">import</span> { payingKit } <span style="color: rgb(255, 123, 114); font-weight: 400;">from</span> <span style="color: rgb(165, 214, 255); font-weight: 400;">'@ldclabs/1paying-kit'</span>

<span style="color: rgb(255, 123, 114); font-weight: 400;">async</span> <span style="color: rgb(255, 123, 114); font-weight: 400;">function</span> <span style="color: rgb(210, 168, 255); font-weight: 400;">fetchData</span>(<span style="color: rgb(201, 209, 217); font-weight: 400;"></span>) {
  <span style="color: rgb(255, 123, 114); font-weight: 400;">let</span> response = <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> <span style="color: rgb(210, 168, 255); font-weight: 400;">fetch</span>(<span style="color: rgb(165, 214, 255); font-weight: 400;">'https://api.example.com/premium-data'</span>)

  <span style="color: rgb(139, 148, 158); font-weight: 400;">// Check if payment is required</span>
  <span style="color: rgb(255, 123, 114); font-weight: 400;">const</span> {payUrl, txid} = <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> payingKit.<span style="color: rgb(210, 168, 255); font-weight: 400;">tryGetPayUrl</span>(response)
  <span style="color: rgb(255, 123, 114); font-weight: 400;">if</span> (payUrl) {
    <span style="color: rgb(139, 148, 158); font-weight: 400;">// Payment is required, handle it with the kit</span>
    <span style="color: rgb(255, 123, 114); font-weight: 400;">console</span>.<span style="color: rgb(210, 168, 255); font-weight: 400;">log</span>(<span style="color: rgb(165, 214, 255); font-weight: 400;">\`Please complete the payment at: <span style="color: rgb(201, 209, 217); font-weight: 400;">\${payUrl}</span>\`</span>)
    <span style="color: rgb(255, 123, 114); font-weight: 400;">window</span>.<span style="color: rgb(210, 168, 255); font-weight: 400;">open</span>(payUrl, <span style="color: rgb(165, 214, 255); font-weight: 400;">'1Pay.ing'</span>) <span style="color: rgb(139, 148, 158); font-weight: 400;">// Redirect user to sign the payment</span>

    <span style="color: rgb(255, 123, 114); font-weight: 400;">try</span> {
      <span style="color: rgb(255, 123, 114); font-weight: 400;">const</span> payload = <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> payingKit.<span style="color: rgb(210, 168, 255); font-weight: 400;">waitForPaymentPayload</span>(txid, {
        <span style="color: rgb(121, 192, 255); font-weight: 400;">onprogress</span>: <span style="color: rgb(201, 209, 217); font-weight: 400;">(<span style="color: rgb(201, 209, 217); font-weight: 400;">state</span>) =&gt;</span> {
          <span style="color: rgb(255, 123, 114); font-weight: 400;">console</span>.<span style="color: rgb(210, 168, 255); font-weight: 400;">log</span>(<span style="color: rgb(165, 214, 255); font-weight: 400;">\`Payment status: <span style="color: rgb(201, 209, 217); font-weight: 400;">\${state.status}</span>, attempt: <span style="color: rgb(201, 209, 217); font-weight: 400;">\${state.attempt}</span>\`</span>)
        },
      })
      <span style="color: rgb(255, 123, 114); font-weight: 400;">console</span>.<span style="color: rgb(210, 168, 255); font-weight: 400;">log</span>(<span style="color: rgb(165, 214, 255); font-weight: 400;">'Payment successful! Received x402 PaymentPayload:'</span>, payload)

      <span style="color: rgb(139, 148, 158); font-weight: 400;">// Now you can retry the original request with the payment payload</span>
      <span style="color: rgb(139, 148, 158); font-weight: 400;">// typically in an 'Authorization' or 'X-Payment' header.</span>
      response = <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> <span style="color: rgb(210, 168, 255); font-weight: 400;">fetch</span>(<span style="color: rgb(165, 214, 255); font-weight: 400;">'https://api.example.com/premium-data'</span>, {
        <span style="color: rgb(121, 192, 255); font-weight: 400;">headers</span>: {
          <span style="color: rgb(165, 214, 255); font-weight: 400;">'X-PAYMENT'</span>: payload,
        },
      })
    } <span style="color: rgb(255, 123, 114); font-weight: 400;">catch</span> (error) {
      <span style="color: rgb(255, 123, 114); font-weight: 400;">console</span>.<span style="color: rgb(210, 168, 255); font-weight: 400;">error</span>(<span style="color: rgb(165, 214, 255); font-weight: 400;">'Payment failed or timed out:'</span>, error)
      <span style="color: rgb(255, 123, 114); font-weight: 400;">throw</span> error
    }
  }

  <span style="color: rgb(139, 148, 158); font-weight: 400;">// Process the successful response</span>
  <span style="color: rgb(255, 123, 114); font-weight: 400;">const</span> data = <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> response.<span style="color: rgb(210, 168, 255); font-weight: 400;">json</span>()
  <span style="color: rgb(255, 123, 114); font-weight: 400;">console</span>.<span style="color: rgb(210, 168, 255); font-weight: 400;">log</span>(<span style="color: rgb(165, 214, 255); font-weight: 400;">'Data received:'</span>, data)
}</pre>
`

  const developerHighlights = [
    {
      badge: 'Universal',
      title: 'One SDK, Every Wallet',
      description:
        'One integration covers Phantom, MetaMask, WalletConnect, and emerging smart wallets. No custom bridges required.'
    },
    {
      badge: 'DX',
      title: 'Simple, Typed API',
      description:
        'A minimal, promise-based, and fully typed SDK. Drop it into any modern framework and start charging within minutes.'
    },
    {
      badge: 'Secure',
      title: 'Audited & Open-Source',
      description:
        'Non-custodial, open-source SDK plus an audited payment gateway. We never touch user keys—we only coordinate signing requests.'
    },
    {
      badge: 'Identity',
      title: 'Decoupled by Design',
      description:
        'Our session-based architecture keeps your Web2 accounts intact while attaching verifiable proof of payment from any wallet.'
    },
    {
      badge: 'Future-Proof',
      title: 'For x402 and Beyond',
      description:
        "Launch on Solana today, expand to other chains tomorrow. We track the x402 spec and upcoming payment protocols so you don't have to."
    },
    {
      badge: 'UX',
      title: 'A Checkout That Converts',
      description:
        'Polished visuals and a flow that builds trust. Turn curious users into paying customers without the steep drop-off of classic Web3 UX.'
    }
  ]

  const tokenFlywheels = [
    {
      title: 'Proof-of-Adoption',
      description:
        'Rewards builders who integrate the 1Pay.ing Kit, multiplying our reach with every new HTTP 402 touchpoint.'
    },
    {
      title: 'Proof-of-Usage',
      description:
        'Returns value to wallet users who transact through 1Pay.ing, anchoring daily payment activity with meaningful incentives.'
    }
  ]

  const tokenUtilities = [
    {
      badge: 'B2D',
      title: 'Empowering Developers',
      points: [
        'Integrate-to-Earn rewards adopters of the 1Pay.ing Kit on every qualified transaction they facilitate.',
        'Staking PAY unlocks premium services like facilitator gas sponsorship, enterprise SLAs, and advanced analytics.'
      ]
    },
    {
      badge: 'B2C',
      title: 'Empowering Users',
      points: [
        'Pay-to-Earn returns a percentage of every x402 payment as PAY rebates, the Web3 equivalent of cashback.',
        'Stake-to-Earn keeps rebates productive with in-wallet yield, turning the wallet into a lightweight asset hub.'
      ]
    },
    {
      badge: 'Shared',
      title: 'Ecosystem Alignment',
      points: [
        'Governance via vePAY lets the community tune incentives, treasury allocations, and the roadmap.',
        'Privilege tiers unlock enhanced privacy, higher rebate multipliers, and upcoming wallet features.'
      ]
    }
  ]

  const tokenAllocations = [
    {
      label: 'Ecosystem & Community Rewards',
      value: '40% • 400M PAY',
      percentage: 40,
      description:
        'Split between Developer Incentives (20%) and User Incentives (20%) to fuel Integrate-to-Earn and Pay-to-Earn programs.'
    },
    {
      label: 'Public Sale & Liquidity',
      value: '20% • 200M PAY',
      percentage: 20,
      description:
        '10% allocated to an LBP for fair price discovery and treasury formation, 10% paired to seed deep DEX liquidity.'
    },
    {
      label: 'Core Team & Future Contributors',
      value: '18% • 180M PAY',
      percentage: 18,
      description:
        '3-year vesting with a 6-month cliff keeps builders aligned with long-term protocol growth.'
    },
    {
      label: 'Strategic Partners & Advisors',
      value: '12% • 120M PAY',
      percentage: 12,
      description:
        'Vested allocations onboard key distribution, compliance, and infrastructure partners.'
    },
    {
      label: 'Treasury / Foundation',
      value: '10% • 100M PAY',
      percentage: 10,
      description:
        'Supports operations, audits, marketing, and legal under community-supervised stewardship.'
    }
  ]

  const tokenAllocationTotal = {
    label: 'Total Supply',
    value: '1B PAY',
    description:
      'Fixed at genesis on Solana to power the 1Pay.ing network and its value-native economy.'
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
      title: 'Liquidity Bootstrapping Pool (LBP)',
      description:
        'We will launch an LBP with 10% (100M PAY) on a Solana-native venue to discover price and raise $500k-$1M in capital.'
    },
    {
      title: 'Liquidity Lock Commitment',
      description:
        '100% of LBP proceeds pair with another 10% (100M PAY) to seed a major Solana DEX, with LP tokens locked for at least 36 months.'
    }
  ]

  const tokenFlywheelLoop = [
    'Penetration (SDK): Integrate-to-Earn incentives drive adoption of the 1Pay.ing Kit across applications, creating constant entry points.',
    'Conversion (Wallet): New touchpoints guide users into the 1Pay.ing Wallet for readable checkouts and PAY rebates.',
    'Retention (Incentives): Pay-to-Earn rebates and in-wallet staking deepen engagement and keep value inside the ecosystem.',
    'Synergistic Reinforcement: A growing wallet base attracts more developers, while more integrated apps increase reasons to spend and earn.',
    'Value Accrual: Rising TVP and daily activity translate into governance demand for PAY, closing the loop for builders and users.'
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
      links: [{ label: 'X', href: 'https://x.com/i/communities/1988555176517513709' }]
    },
    {
      title: 'Us',
      links: [
        { label: 'About Us', href: 'https://x.com/1Paying' },
        { label: 'Contact', href: 'mailto:hi@1pay.ing' }
      ]
      // },
      // {
      //   title: 'Legal',
      //   links: [
      //     { label: 'Terms of Service', href: 'https://1pay.ing/#terms' },
      //     { label: 'Privacy Policy', href: 'https://1pay.ing/#privacy' }
      //   ]
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
        target="_blank"
        rel="noreferrer"
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
      class="relative min-h-[calc(100vh-80px)] overflow-hidden lg:max-h-[1536px]"
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
            The Value-Native Web
          </span>
          <h1
            class="font-outfit text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
          >
            The internet is paid now. Let's make it seamless.
          </h1>
          <p class="text-lg text-slate-600 sm:text-xl">
            <span class="font-outfit font-bold text-black">1Pay.ing</span> is your
            wallet for the x402 era. Experience instant micropayments, human-readable
            signing, and a trusted home for every on-chain experience.
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
          <div class="flex items-center justify-between">
            <h2
              class="text-base font-semibold tracking-[0.4em] text-slate-600 uppercase"
            >
              App Preview
            </h2>
            <PrimaryButton
              onclick={launchApp}
              isLoading={isLoadingApp}
              class="bg-sky-100! px-4! py-2! font-semibold"
            >
              <span class="text-sky-600">Launch app</span>
            </PrimaryButton>
          </div>
          <p class="mt-4 text-sm text-slate-600">
            Connect one wallet, unlock every HTTP 402 experience. Tap to
            approve, view receipts, and manage your payment history in one
            place.
          </p>
          <div class="mt-6 space-y-4 text-sm text-slate-600">
            <div
              class="rounded-sm border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/5"
            >
              <h3 class="text-sm font-semibold text-slate-900">Example Flows</h3
              >
              <ul class="mt-3 space-y-2">
                <li class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span>Pay-per-article with immediate unlocks</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span>Agent-to-agent streaming payments</span>
                </li>
                <li class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                  <span>Per-call API billing with spending caps</span>
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
                Try It Live
              </h3>
              <p class="mt-3 text-sm text-slate-600">
                Explore our “Buy Me a Coffee” demo powered by 1Pay.ing
                micropayments and see frictionless HTTP 402 flows in action.
              </p>
              <div
                class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span
                  class="text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase"
                >
                  Powered by 1Pay.ing
                </span>
                <a
                  class="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
                  href="https://1paying-coffee.zensh.workers.dev/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit Demo
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
      class="relative min-h-screen border-y border-slate-100 bg-sky-50 py-8 lg:max-h-[1536px] lg:py-24"
    >
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn>
          <p
            class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
            >Why x402 Matters</p
          >
          <h2
            class="mt-6 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Pay-as-you-go for everything you read, watch, build, and automate.
          </h2>
          <p class="mt-6 max-w-2xl text-base text-slate-600">
            The x402 protocol turns payments into a native part of the web.
            <span class="font-outfit font-bold text-black">1Pay.ing</span> makes
            it an everyday wallet, so you can tip creators, unlock APIs, or let your
            AI agents transact on your behalf—without subscriptions or borders.
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
      id="developers"
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-screen py-8 lg:max-h-[1536px] lg:py-24"
    >
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn>
          <p
            class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
            >For Developers</p
          >
          <h2
            class="mt-6 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Ship x402 payments without rewriting your front-end.
          </h2>
          <p class="mt-6 max-w-3xl text-base text-slate-600">
            <span class="font-outfit font-bold text-black">1Pay.ing</span> packages
            wallet detection, signature UX, and identity handshakes into a single
            SDK. You keep your stack; we deliver a polished checkout that works across
            every wallet and protocol.
          </p>
        </div>
        <div class="mt-12 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div use:staggerChildren>
            <h3
              class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
              >Integration in Minutes</h3
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
              >Code Sample</div
            >
            <p class="mt-4 text-sm text-slate-600">
              Fully typed, promise-based, and designed to drop straight into
              your existing fetch flow.
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
      class="relative min-h-screen bg-sky-50 py-8 lg:max-h-[1536px] lg:py-24"
    >
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn>
          <p
            class="text-sm font-semibold tracking-[0.4em] text-sky-600 uppercase"
            >Everything You Need</p
          >
          <h2
            class="mt-6 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Build a flawless payment flow without touching wallet internals.
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
      class="relative min-h-screen overflow-hidden py-8 lg:max-h-[2048px] lg:py-24"
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
            Tokenomics for a new payment economy.
          </h2>
          <p class="mt-6 max-w-3xl text-base text-slate-600">
            <span class="font-outfit font-bold text-black">PAY</span> (<a
              href="https://solscan.io/token/PAYiNGqaLFRdBomkQY3JXZeCm7wzK7hKuhrJDzcZBWN"
              target="_blank"
              class="inline-flex flex-row items-center align-middle text-xs hover:text-sky-500"
            >
              <img
                src="/_assets/images/sol.webp"
                alt="Solana"
                class="mr-1 inline-block size-4 rounded-full align-middle"
              />
              <span>PAYiNG...ZBWN</span>
              <span class="*:size-4"><ArrowRightUpLine /></span>
            </a>) is the coordination token for
            <span class="font-outfit font-bold text-black">1Pay.ing</span>,
            aligning users, facilitators, and the foundation to grow the x402
            ecosystem. Supply is capped at 1 billion tokens, with emissions tied
            to real usage and network growth.
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
              The PAY Flywheel
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
            >Get Involved</p
          >
          <h2 class="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to build the new web of value?
          </h2>
          <p class="mt-6 text-base text-slate-600">
            Start accepting x402 payments today. The next economy is
            permissionless, instant, and waiting for you.
          </p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              class="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              href="https://github.com/ldclabs/1paying-kit"
              target="_blank"
              rel="noreferrer"
            >
              Read the Docs
            </a>
            <a
              class="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-white/70"
              href="https://x.com/1Paying"
              target="_blank"
              rel="noreferrer"
            >
              Join the Community
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
                    target="_blank"
                    rel="noreferrer">{link.label}</a
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
              target="_blank"
              rel="noreferrer"
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
