import { useState } from "react";
import { MdAdd, MdRemove } from "react-icons/md";

const CUSTOMER_PROTECTION_FAQS = [
  {
    question: "How can I customize my lens package?",
    answer:
      "You can choose lens type, power options, and add-ons on the product details page before adding to cart.",
  },
  {
    question: "Can I reorder my previous items?",
    answer:
      "Yes. Visit your account orders page and use the reorder action to place the same items again quickly.",
  },
  {
    question: "Can I restrict access to specific products?",
    answer:
      "Selected products can be set as private or member-only through catalog settings in the admin dashboard.",
  },
  {
    question: "Does the product page show key details clearly?",
    answer:
      "Yes. Each product page includes highlights, pricing, ratings, stock, and shipping-related information.",
  },
  {
    question: "How can I contact support for order help?",
    answer:
      "Use the contact page or order support options from your account dashboard for quick assistance.",
  },
];

const CustomerProtection = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <section className="relative overflow-hidden bg-[#ece7e2]">
        <div className="relative h-[420px] w-full overflow-hidden sm:h-[500px] lg:h-[560px]">
          <img
            src="assets/logos/customer-protection.jpg"
            alt="Mountain landscape"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute inset-x-0 bottom-8 flex justify-center px-4">
            <h1 className="text-center text-2xl font-black uppercase tracking-[0.06em] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] sm:text-3xl lg:text-[3.1rem] leading-[0.95]">
              CUSTOMER PROTECTION PROGRAMS
            </h1>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mx-auto max-w-5xl text-sm leading-relaxed text-[#303030] sm:text-base lg:text-lg">
            We bring you stylish, high-quality products for everyday life,
            making it easy to find what you love and feel good about every
            purchase.
          </p>

          <div className="mx-auto mt-8 h-px w-full max-w-5xl bg-black/20" />
        </div>
      </section>

      <section className="bg-white px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-md bg-[#ffffff] px-4 py-6 sm:px-6">
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-700">
            FAQ
          </h2>

          <div className="divide-y divide-gray-200 bg-white">
            {CUSTOMER_PROTECTION_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex((current) =>
                        current === index ? -1 : index,
                      )
                    }
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-bold text-gray-700 transition hover:bg-gray-50 sm:px-4"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <MdRemove className="h-5 w-5 text-[#68a300]" />
                    ) : (
                      <MdAdd className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  <div
                    className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0">
                      <div className="border-t border-gray-100 bg-white px-3 py-3 text-xs leading-6 text-gray-600 sm:px-4 sm:text-sm">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerProtection;
