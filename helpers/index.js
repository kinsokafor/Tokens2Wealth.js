const toLocale = (str, prefix = "", suffix = "") => {
    if(str == "" || str == undefined) str = 0;

    function ordinaryString() {
        var parts = (Math.round(str * 100) / 100).toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return prefix+parts.join(".")+suffix;
    }

    if(prefix != "" || suffix != "") return ordinaryString();
    
    str = parseFloat(str);
    return str.toLocaleString("en-NG", {
        style:"currency", 
        currency:"NGN"
    })
} 

export {toLocale}

export function calculateInterest(principal, rate, time) {
    // Convert rate from percentage to decimal
    let decimalRate = rate / 100;
    let timeInYears = time / 12;
    // Calculate interest
    let interest = principal * decimalRate * timeInYears;
    return interest;
}