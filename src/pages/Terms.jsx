import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-[#1f2937]">
        <h1 className="text-3xl font-bold text-[#111827]">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          <strong>Last Updated: November 22, 2026</strong>
        </p>

        <p className="mt-6 leading-7">
          Welcome to <strong>Naashpati</strong>. These Terms &amp; Conditions
          govern your use of our website and the purchase of products from our
          online store. By accessing our website or placing an order, you agree
          to these terms. Please read them carefully before making a purchase.
        </p>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            1. About Our Store
          </h2>
          <p className="leading-7">
            Naashpati is an online retailer specializing in sunglasses and
            eyewear accessories. Throughout these terms, the words "we", "us",
            and "our" refer to Naashpati, while "you" and "your" refer to
            visitors and customers of our website.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            2. Use of Our Website
          </h2>
          <p className="leading-7">By using this website, you confirm that:</p>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            <li>
              You are legally capable of entering into a purchase agreement.
            </li>
            <li>
              The information you provide during checkout is accurate and
              complete.
            </li>
            <li>
              You will not use our website for unlawful or fraudulent purposes.
            </li>
            <li>
              You will not attempt to disrupt, damage, or gain unauthorized
              access to our website.
            </li>
          </ul>
          <p className="leading-7">
            We reserve the right to restrict or terminate access to our website
            if these terms are violated.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            3. Product Information
          </h2>
          <p className="leading-7">
            We make every reasonable effort to display our sunglasses
            accurately, including their colors, materials, designs, and
            features.
          </p>
          <p className="leading-7">However:</p>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            <li>
              Actual product colors may vary slightly due to screen settings and
              lighting conditions.
            </li>
            <li>
              Product images are for illustrative purposes; minor variations may
              occur.
            </li>
            <li>
              Product specifications, availability, and prices may change
              without prior notice.
            </li>
          </ul>
          <p className="leading-7">
            Please review product descriptions carefully before placing an
            order.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            4. Orders and Acceptance
          </h2>
          <p className="leading-7">
            When you place an order, you are submitting a purchase request.
          </p>
          <p className="leading-7">
            An order is considered accepted once we confirm it through Email and
            WhatsApp.
          </p>
          <p className="leading-7">
            We reserve the right to cancel or refuse an order in situations
            including:
          </p>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            <li>Product unavailability.</li>
            <li>Incorrect pricing or product information.</li>
            <li>Suspected fraudulent activity.</li>
            <li>Incomplete or inaccurate customer information.</li>
            <li>Delivery limitations.</li>
          </ul>
          <p className="leading-7">
            If payment has already been collected for a cancelled order, we will
            arrange a refund using an appropriate payment method.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            5. Pricing and Payments
          </h2>
          <p className="leading-7">
            All product prices are displayed in <strong>Rupees</strong>, unless
            otherwise stated.
          </p>
          <p className="leading-7">
            We reserve the right to update prices, promotions, and discounts at
            any time. The price applicable to your order will be the price
            displayed at the time of checkout, subject to correction of genuine
            pricing errors.
          </p>
          <p className="leading-7">We accept the following payment methods:</p>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            <li>Cash on Delivery</li>
            {/* <li>Bank Transfer</li> */}
            <li>Other Payment Methods</li>
          </ul>
          <p className="leading-7">
            Any applicable delivery charges, taxes, or additional fees will be
            displayed or communicated before order confirmation.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            6. Shipping and Delivery
          </h2>
          <p className="leading-7">
            We aim to process and dispatch orders within maximum 2 business
            days.
          </p>
          <p className="leading-7">Estimated delivery times are:</p>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            <li>
              <strong>Within Peshawar / Khyber Pakhtunkhwa:</strong> 3
            </li>
            <li>
              <strong>Other Cities:</strong> 3 or maybe more than 3
            </li>
          </ul>
          <p className="leading-7">
            Delivery estimates are not guaranteed and may be affected by courier
            delays, weather, public holidays, or other circumstances beyond our
            control.
          </p>
          <p className="leading-7">
            Customers are responsible for providing a complete and accurate
            delivery address and contact number.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            7. Returns and Exchanges
          </h2>
          <p className="leading-7">
            We want you to be satisfied with your purchase. If you wish to
            return or exchange an item, please contact us within{" "}
            <strong>7 days</strong> of receiving your order.
          </p>
          <p className="leading-7">To qualify for a return or exchange:</p>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            <li>
              The sunglasses must be unused and in their original condition.
            </li>
            <li>Original packaging, accessories, and tags must be included.</li>
            <li>Proof of purchase must be provided.</li>
            <li>
              The item must not have been damaged through misuse or accidental
              handling.
            </li>
          </ul>
          <p className="leading-7">
            For hygiene and product-condition reasons, used, scratched, or
            altered sunglasses may not qualify for a return unless required by
            applicable law.
          </p>
          <p className="leading-7">
            <strong>Non-returnable items:</strong> broken product, scratched
            product, incomplete product related things in packaging, scratched
            or destroyed packaging boxes.
          </p>
          <p className="leading-7">
            <strong>Return shipping costs:</strong> The customers who are
            willing to return their order are required to pay for shipping
            costs.
          </p>
          <p className="leading-7">
            <strong>Refund processing:</strong> Approved refunds will be
            processed within 2 business days.
          </p>
          <p className="leading-7">
            Please contact{" "}
            <a
              className="text-herbs-700 underline"
              href="mailto:info@naashpati.com"
            >
              info@naashpati.com
            </a>{" "}
            before sending any item back.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            8. Product Warranty and Defects
          </h2>
          <p className="leading-7">
            If a product arrives damaged or has a manufacturing defect, please
            contact us within <strong>7 days</strong> of delivery and provide
            photographs or other relevant evidence.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            9. Sunglasses Care and Use
          </h2>
          <p className="leading-7">
            To maintain your sunglasses in good condition, we recommend:
          </p>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            <li>
              Keeping them in their protective case or sunglasses box when not
              in use.
            </li>
            <li>Cleaning lenses with a microfiber cloth.</li>
            <li>Avoiding harsh chemicals and abrasive materials.</li>
            <li>
              Avoiding excessive heat or prolonged exposure to high
              temperatures.
            </li>
            <li>Handling frames and hinges carefully.</li>
          </ul>
          <p className="leading-7">
            Unless expressly stated in the product description, do not assume
            that sunglasses provide UV protection, polarized lenses,
            prescription correction, or other specialized optical features.
            Always check the specifications before purchasing.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            10. Privacy and Personal Information
          </h2>
          <p className="leading-7">
            We respect your privacy and handle customer information in
            accordance with our{" "}
            <Link
              to="/privacy"
              className="font-semibold text-herbs-700 underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p className="leading-7">
            Information such as your name, contact number, delivery address, and
            order details may be collected and used to process orders, arrange
            deliveries, provide customer support, and meet legal obligations.
          </p>
          <p className="leading-7">
            Please read our Privacy Policy for further details.
          </p>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold text-[#111827]">
            11. Changes to These Terms
          </h2>
          <p className="leading-7">
            We may update these Terms &amp; Conditions from time to time to
            reflect changes in our business, services, or legal requirements.
          </p>
          <p className="leading-7">
            Any updated version will be published on this page with a revised
            "Last Updated" date. Your continued use of our website after changes
            are published indicates acceptance of the updated terms.
          </p>
        </section>

        <section className="mt-8 space-y-4 pb-8">
          <h2 className="text-xl font-semibold text-[#111827]">
            15. Contact Us
          </h2>
          <p className="leading-7">
            If you have any questions about these Terms &amp; Conditions,
            orders, returns, or our products, please contact us:
          </p>
          <p className="leading-7">
            <strong>Naashpati</strong>
          </p>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            <li>
              <strong>Email:</strong>{" "}
              <a
                className="text-herbs-700 underline"
                href="mailto:info@naashpati.com"
              >
                info@naashpati.com
              </a>
            </li>
            <li>
              <strong>Phone / WhatsApp:</strong> +923400980990
            </li>
            <li>
              <strong>Address:</strong> Your Business Address
            </li>
            <li>
              <strong>Website:</strong> naashpati.com
            </li>
          </ul>
          <p className="leading-7">Thank you!</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
