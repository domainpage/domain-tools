const {options, getDomains} = require('../config');
const fetch = require("node-fetch");
const batchRequest = require("batch-request-js");

const GODADDY_BATCH_SIZE = 1;
const GODADDY_RATE_LIMIT_DELAY = 0;

const domains = getDomains();
let domainsForwardedCount = 0;

const calculateProgress = (domainsUpdated, totalDomains) => {
    return ((domainsUpdated / totalDomains) * 100).toFixed(2);
}

const domainForwardingUpdate = async (domain) => {
    domainsForwardedCount++;
    const payload = {
        type: "REDIRECT_TEMPORARY",
        url: `https://${options.domainPageUsername}.domainpage.io/${domain}`
    }

    const res = await fetch(`https://api.godaddy.com/v2/customers/${options.goDaddyCustomerNumber}/domains/forwards/${domain}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `sso-key ${options.goDaddyApiKey}:${options.goDaddyApiSecret}`
        },
        body: JSON.stringify(payload)
    })
    if (!res.ok) return console.error(`Error forwarding domain: ${domain} - [${res.status}]: ${res.statusText}`);
    console.info('----------')
    console.info(`[${calculateProgress(domainsForwardedCount, domains.length)}%]`)
    console.info(`Domain: ${domain}`)
    console.info(`Redirect: https://${options.domainPageUsername}.domainpage.io/${domain}`)
    console.info('----------\n')
}

const domainTxtRecordUpdate = async (domain) => {
    const payload = [
        {
            data: `domainpage-owner=${options.domainPageUsername}`,
            name: "@"
        }
    ]

    const res = await fetch(`https://api.godaddy.com/v1/domains/${domain}/records/TXT`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `sso-key ${options.goDaddyApiKey}:${options.goDaddyApiSecret}`
        },
        body: JSON.stringify(payload)
    })
    if (!res.ok) return console.error(`Error updating TXT record for domain: ${domain} - [${res.status}]: ${res.statusText}`);
}

const bulkDomainUpdate = async () => {
    const { error: domainForwardingError, data: domainForwardingData } = await batchRequest(domains, domainForwardingUpdate, { batchSize: GODADDY_BATCH_SIZE, delay: GODADDY_RATE_LIMIT_DELAY });
    const { error: domainTxtError, data: domainTxtData } = await batchRequest(domains, domainTxtRecordUpdate, { batchSize: GODADDY_BATCH_SIZE, delay: GODADDY_RATE_LIMIT_DELAY });
}

bulkDomainUpdate().catch(err => err);
