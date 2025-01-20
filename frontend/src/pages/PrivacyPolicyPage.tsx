import {LanguageSelector, useLanguage} from "../LanguageContext";


export default function PrivacyPolicyPage() {
  const {t, currentLanguage} = useLanguage();

  return (
    <div className="bg-gray-200 py-6 px-2 sm:px-6 rounded-lg max-w-4xl mx-auto mt-8">
      <div>
        <LanguageSelector/>
      </div>

      <h1 className="text-3xl font-bold text-center mb-4">
        {t("privacy-policy.title")}
      </h1>

      {currentLanguage === "pl"
        ?
        <>
          <section className="mb-6">
            <h2 className="text-2xl font-semibold">1. Informacje ogólne</h2>
            <p>Niniejsza Polityka Prywatności wyjaśnia, w jaki sposób zbieramy, wykorzystujemy i chronimy Twoje dane osobowe zgodnie z RODO.</p>

            <h2 className="text-2xl font-semibold mt-4">2. Administrator danych</h2>
            <p>Administratorem danych jest [nazwa firmy], z siedzibą w [adres firmy]. Można się z nami skontaktować pod adresem [adres e-mail].</p>

            <h2 className="text-2xl font-semibold mt-4">3. Jakie dane zbieramy</h2>
            <ul className="list-disc pl-5">
              <li>Imię i nazwisko</li>
              <li>Adres e-mail</li>
              <li>Adres IP</li>
              <li>Informacje powiązane z Twoim kontem Google</li>
              <li>Inne informacje podane dobrowolnie przez Ciebie</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-4">4. Cel przetwarzania danych</h2>
            <ul className="list-disc pl-5">
              <li>Świadczenie naszych usług</li>
              <li>Odpowiedzi na zapytania</li>
              <li>Usprawnienie naszej strony i usług</li>
              <li>Wypełnianie obowiązków prawnych</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-4">5. Podstawa prawna przetwarzania</h2>
            <ul className="list-disc pl-5">
              <li>Twoja zgoda</li>
              <li>Wykonanie umowy</li>
              <li>Obowiązki prawne</li>
              <li>Uzasadniony interes</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-4">6. Przechowywanie danych</h2>
            <p>Przechowujemy Twoje dane tak długo, jak jest to konieczne do realizacji powyższych celów lub zgodnie z wymogami prawnymi.</p>

            <h2 className="text-2xl font-semibold mt-4">7. Ochrona danych</h2>
            <p>Wdrażamy odpowiednie środki bezpieczeństwa, aby chronić Twoje dane przed nieautoryzowanym dostępem, zmianą, ujawnieniem lub zniszczeniem.</p>

            <h2 className="text-2xl font-semibold mt-4">8. Twoje prawa</h2>
            <ul className="list-disc pl-5">
              <li>Dostęp, poprawianie lub usunięcie swoich danych</li>
              <li>Cofnięcie zgody w dowolnym momencie</li>
              <li>Sprzeciw wobec przetwarzania danych</li>
              <li>Złożenie skargi do organu ochrony danych</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-4">9. Kontakt</h2>
            <p>Jeśli masz pytania dotyczące tej polityki, skontaktuj się z nami pod adresem [adres e-mail].</p>
          </section>
        </>
        :
        <>
          <section className="mb-6">
            <h2 className="text-2xl font-semibold">1. General Information</h2>
            <p>This Privacy Policy explains how we collect, use, and protect your personal data in accordance with the General Data Protection Regulation (GDPR).</p>

            <h2 className="text-2xl font-semibold mt-4">2. Data Controller</h2>
            <p>The data controller is [Company Name], located at [Company Address]. You can contact us at [Email Address].</p>

            <h2 className="text-2xl font-semibold mt-4">3. Data We Collect</h2>
            <ul className="list-disc pl-5">
              <li>Name and surname</li>
              <li>Email address</li>
              <li>IP address</li>
              <li>Information related to your Google account</li>
              <li>Other voluntarily provided information</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-4">4. Purpose of Data Processing</h2>
            <ul className="list-disc pl-5">
              <li>Providing our services</li>
              <li>Responding to inquiries</li>
              <li>Improving our website and services</li>
              <li>Fulfilling legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-4">5. Legal Basis for Processing</h2>
            <ul className="list-disc pl-5">
              <li>Your consent</li>
              <li>Contract performance</li>
              <li>Legal obligations</li>
              <li>Legitimate interests</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-4">6. Data Retention</h2>
            <p>We store your data only for as long as necessary to fulfill the purposes mentioned above or as required by law.</p>

            <h2 className="text-2xl font-semibold mt-4">7. Data Protection</h2>
            <p>We implement appropriate security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.</p>

            <h2 className="text-2xl font-semibold mt-4">8. Your Rights</h2>
            <ul className="list-disc pl-5">
              <li>Access, correct, or delete your data</li>
              <li>Withdraw consent at any time</li>
              <li>Object to data processing</li>
              <li>Lodge a complaint with a data protection authority</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-4">9. Contact Information</h2>
            <p>If you have any questions about this policy, please contact us at [Email Address].</p>
          </section>
        </>
      }

    </div>
  );
}
