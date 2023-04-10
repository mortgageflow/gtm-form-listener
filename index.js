//GTM Global Form Submission Tracker

var hsFormHandlers = [
    {
        id: "90bd193e-2f48-4a2c-bb8e-f2fafa415332",
        slug: "contact_form_submited",
        onSubmit: function (formData) {

            var formType = "";
            if (window.location.pathname === "/book-a-demo/") formType = "book-a-demo";
            if (window.location.pathname === "/contact/") formType = "contact-us";

            posthog.capture('contact_form_submited', {
                formType: formType,
                message: formData.message
            });

            posthog.identify(formData.email, {
                name: formData.firstname + " " + formData.lastname,
                email: formData.email,
                number_of_customers: formData.number_of_customers
            });
        }
    },
    {
        id: "56a0f3dd-6fc1-4458-a763-c6039d152fa6",
        slug: "book_a_demo_landing_form",
        onSubmit: function (formData) {

            posthog.capture('contact_form_submited', {
                formType: "book-a-demo",
                message: formData.message
            });

            posthog.identify(formData.email, {
                name: formData.firstname + " " + formData.lastname,
                email: formData.email,
                number_of_customers: formData.number_of_customers
            });
        }
    },
    {
        id: "cbbdd3bd-9a15-418f-ac0c-f16e08e745ae",
        slug: "resource_download_form",
        onSubmit: function (formData) {
            //https://content.propellocloud.com/resources-partnership-marketing-playbook
            posthog.capture('resource_download', {
            });

            posthog.identify(formData.email, {
                name: formData.firstname + " " + formData.lastname,
                email: formData.email,
            });
        }
    },
];

//cbbdd3bd-9a15-418f-ac0c-f16e08e745ae

//Capature Hubspot Forms Submited
window.addEventListener("message", function (event) {

    //Uncomment to view all events in the console
    //console.log("event", event);
    //console.log('event data -> ', event.data);

    if (event.data.type === 'hsFormCallback' && event.data.eventName === 'onFormSubmit') {
        var formHandler = hsFormHandlers.find(function (f) { return f.id === event.data.id });
        if (formHandler) {

            //Map array of objects into key value pairs
            var formData = event.data.data.reduce(function (acc, current) {
                acc[current.name] = current.value;
                return acc;
            }, {});

            formHandler.onSubmit(formData);
            console.log(formHandler.slug + " form submited with following data ", formData);
        }
    }
});


//Chat Bot Event Listener
function onConversationsAPIReady() {
    window.HubSpotConversations.on('conversationStarted', function (payload) {

        //Data layer event
        window.dataLayer.push({
            'event': 'hubspot-conversation-started',
            'hs-conversation-id': payload.conversation.conversationId
        });


        posthog.capture('contact_form_submited', {
            formType: "chat",
        });

    });
}


if (window.HubSpotConversations) {
    onConversationsAPIReady();
} else {
    window.hsConversationsOnReady = [onConversationsAPIReady];
}


//Email & Tell Listeners
jQuery("a[href^='mailto']").on('click', function () {
    var emailValue = this.getAttribute("href").replace("mailto:", "");
    posthog.capture("contact_clicked", {
        contact_type: "email",
        contact_value: emailValue,
    });
});

jQuery("a[href^='tel']").on('click', function () {
    var telValue = this.getAttribute("href").replace("tel:", "");
    posthog.capture("contact_clicked", {
        contact_type: "phone",
        contact_value: telValue,
    });
});
