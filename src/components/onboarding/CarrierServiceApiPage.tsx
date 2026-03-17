'use client';

import Image from 'next/image';
import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';
import { ZonosLogoIcon } from '@zonos/amino/icons/custom/logo/ZonosLogoIcon';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';
import styles from './CarrierServiceApiPage.module.scss';

const REQUIREMENTS = [
  {
    text: 'Your store is on the Advanced Shopify plan or higher',
    note: null,
  },
  {
    text: 'Pay an extra $20/month',
    note: null,
  },
  {
    text: 'Your Shopify plan is paid annually',
    note: 'Usually the preferred method by merchants',
  },
];

export const CarrierServiceApiPage = () => {
  const { shopifyPlan, acknowledgeCarrierApi, setEditingPlan } = useOnboardingStore();
  const planLabel = shopifyPlan ? shopifyPlan.charAt(0).toUpperCase() + shopifyPlan.slice(1) : '';

  const handleBack = () => {
    setEditingPlan(true);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoRow}>
            <div className={styles.shopifyLogo}>
              <Image src="/shopify-icon.svg" alt="Shopify" width={22} height={22} />
            </div>
            <div className={styles.connector} />
            <div className={styles.zonosLogo}>
              <ZonosLogoIcon size={32} />
            </div>
          </div>
          <Text type="title">One more step required</Text>
          {planLabel && (
            <div className={styles.planBadge}>
              <span className={styles.planBadgeLabel}>Selected plan</span>
              <span className={styles.planBadgeName}>{planLabel}</span>
              <button className={styles.changePlanButton} onClick={handleBack}>
                Change plan
              </button>
            </div>
          )}
          <Text type="body" color="gray600">
            Your current Shopify plan requires an additional step to enable
            real-time shipping rates with Zonos.
          </Text>
        </div>

        <div className={styles.card}>
          <div className={styles.instruction}>
            <div className={styles.instructionIcon}>1</div>
            <p className={styles.instructionText}>
              Contact{' '}
              <a
                href="https://help.shopify.com/en/partners"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Shopify Support via chat
              </a>{' '}
              and ask them to grant your account access to the{' '}
              <strong>Carrier Service API</strong>.
            </p>
          </div>

          <div className={styles.divider} />

          <div>
            <p className={styles.requirementsLabel}>
              You must meet one of these requirements
            </p>
            <div className={styles.requirementsList}>
              {REQUIREMENTS.map((req, i) => (
                <div key={i} className={styles.requirement}>
                  <div className={styles.requirementDot} />
                  <div>
                    <p className={styles.requirementText}>{req.text}</p>
                    {req.note && (
                      <p className={styles.requirementNote}>{req.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="primary" size="lg" onClick={acknowledgeCarrierApi}>
            Confirm API Access Enabled
          </Button>
        </div>
      </div>
    </div>
  );
};
