export function getBaseUrl(env) {
    var baseUrl;
    switch (env) {
        case 'at21':
            baseUrl = 'https://platform.at21.altinn.cloud/';
            break;
        case 'at22':
            baseUrl = 'https://platform.at22.altinn.cloud/';
            break;
        case 'at23':
            baseUrl = 'https://platform.at23.altinn.cloud/';
            break;
        case 'at24':
            baseUrl = 'https://platform.at24.altinn.cloud/';
            break;
        case 'tt02':
            baseUrl = 'https://platform.tt02.altinn.no/';
            break;
        case 'yt01':
            baseUrl = 'https://platform.yt01.altinn.cloud/';
            break;
        default:
            baseUrl = 'https://platform.at21.altinn.cloud/';
            break; 
    }
    return baseUrl;
}