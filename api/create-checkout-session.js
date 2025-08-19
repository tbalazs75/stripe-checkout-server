import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.PRICE_ID, quantity: 1 }],
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,

      // Kötelező jelölőnégyzet a Stripe Checkouton
      consent_collection: { terms_of_service: "required" },

      // A checkbox melletti jogi szöveg (ÁSZF + Adatkezelés linkkel)
      custom_text: {
        terms_of_service_acceptance: {
          message:
            "Elfogadom az <a href='https://www.tanyeros-coaching.hu/shop_help.php?tab=terms' target='_blank'>Általános Szerződési Feltételeket</a> és az <a href='https://www.tanyeros-coaching.hu/shop_help.php?tab=terms' target='_blank'>Adatkezelési Tájékoztatót</a>. Tudomásul veszem, hogy a megrendelés elküldése fizetési kötelezettséggel jár. Továbbá hozzájárulok, hogy a díj kifizetése után azonnal hozzáférést kapjak a szolgáltatáshoz és tudomásul veszem, hogy ezt követően nem gyakorolhatok elállási jogot a 45/2014. (II.26.) Korm. rendelet 29. § m) pontja alapján."
        }
      }
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}
