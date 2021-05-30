const {options, getDomains} = require('../config');
const fetch = require("node-fetch");
const batchRequest = require("batch-request-js");

const GODADDY_BATCH_SIZE = 1;
const GODADDY_RATE_LIMIT_DELAY = 1100;

const domains = getDomains();
let domainUpdatedCount = 0;

const calculateProgress = (domainsUpdated, totalDomains) => {
    return ((domainsUpdated / totalDomains) * 100).toFixed(2);
}

const domainForwardingUpdate = async (domain) => {
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

const domainUpdate = async (domain) => {
    domainUpdatedCount++;
    domainForwardingUpdate(domain).catch(err => err);
    domainTxtRecordUpdate(domain).catch(err => err);
    console.info('----------')
    console.info(`[${calculateProgress(domainUpdatedCount, domains.length)}% complete - ${domains.length - domainUpdatedCount} remaining]`)
    console.info(`Domain: ${domain}`)
    console.info(`Redirect: https://${options.domainPageUsername}.domainpage.io/${domain}`)
    console.info(`TXT Record: domainpage-owner=${options.domainPageUsername}`)
    console.info('----------\n')
}

const bulkDomainUpdate = async () => {
    const { error, data } = await batchRequest(domains, domainUpdate, { batchSize: GODADDY_BATCH_SIZE, delay: GODADDY_RATE_LIMIT_DELAY });
    if (error) console.error(`Error updating domain: ${error}`);
}

bulkDomainUpdate().catch(err => err);
