import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.PRICE_ID, quantity: 1 }],
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
billing_address_collection: "required",
      consent_collection: { terms_of_service: "required" },
      custom_text: {
        terms_of_service_acceptance: {
          message:
            "Elfogadom az Általános Szerződési Feltételeket és az Adatkezelési Tájékoztatót. Tudomásul veszem, hogy a megrendelés elküldése fizetési kötelezettséggel jár. Továbbá hozzájárulok, hogy a díj kifizetése után azonnal hozzáférést kapjak a szolgáltatáshoz, és tudomásul veszem, hogy ezt követően nem gyakorolhatok elállási jogot a 45/2014. (II.26.) Korm. rendelet 29. § m) pontja alapján."
        }
      }
    });

    // Stabil, megosztható link: azonnali átirányítás a Stripe Checkoutra
    res.writeHead(302, { Location: session.url });
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Checkout init error");
  }
}
