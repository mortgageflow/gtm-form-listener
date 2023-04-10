//GTM Global Form Submission Tracker

var hsFormHandlers = [
    {
        id: "7fd3776c-6247-4bba-b1c4-fd0a3f645b52",
        slug: "book-a-demo-form",
        onSubmit: function (formData) {
            posthog.capture('contact_form_submitted', {
                form_type: "book-a-demo",
            });

            posthog.identify(formData.email, {
                name: formData.firstname + " " + formData.lastname,
                email: formData.email,
                phone: formData.phone
            });
        }
    },
    {
        id: "de872124-0087-44ac-85ef-27ae2b82c092",
        slug: "get-in-touch-form",
        onSubmit: function (formData) {
            posthog.capture('contact_form_submitted', {
                formType: "contact-us",
                message: formData.message && formData.message
            });

            posthog.identify(formData.email, {
                name: formData.firstname + " " + formData.lastname,
                email: formData.email,
                phone: formData.phone,
            });
        }
    },
];

var hsMeetingHandlers = [
    {
        id: "fe3ec00f-3561-4829-ae2b-b80bbf306661",
        slug: "book-a-demo-meeting",
        onSubmit: function (formData) {

            var contact = formData.contact;

            posthog.capture('contact_form_submitted', {
                form_type: "book-a-demo",
            });

            posthog.capture('call_booked', {
                call_booking_method: "website",
            });

            posthog.identify(contact.email, {
                name: contact.firstName + " " + contact.lastName,
                email: contact.email,
            });
        }
    },
]

//Capature Hubspot Forms submitted
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
            console.log(formHandler.slug + " form submitted with following data ", formData);
        }
    }
});

//Capture Hubspot Meeting
window.addEventListener("message", function (event) {
    if (event.origin !== "https://meetings.hubspot.com") return;
    if (!event.data.meetingBookSucceeded) return;

    var bookingFormId = event.data.meetingsPayload.formGuid;
    var bookingHandler = hsMeetingHandlers.find(function (f) { return f.id === bookingFormId });

    var booking = event.data.meetingsPayload.bookingResponse.postResponse;
    if (bookingHandler) bookingHandler.onSubmit(booking);
});


//Chat Bot Event Listener
function onConversationsAPIReady() {
    window.HubSpotConversations.on('conversationStarted', function (payload) {
        posthog.capture('contact_form_submitted', {
            form_type: "chat",
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


//Non Ajax Gravity Form Listener
jQuery("form[data-formid='6']").on('submit', function () {
    var formValues = $(this).serializeArray().reduce(function (acc, item) {
        acc[item.name] = item.value;
        return acc;
    }, {});

    if (!formValues.input_3) return;

    posthog.capture('email_list_subscribed', {});
    posthog.identify(formValues.input_3, {
        name: formValues.input_1,
        email: formValues.input_3,
    });
});

//Custom click listener
jQuery("div.et_pb_module.et_pb_code.et_pb_code_1.play-button  div  a").on('click', function () {
    posthog.capture("watch_video", {video: 'case-study', placement: 'hero-social-proof'});
});
jQuery("div.et_pb_module.et_pb_code.et_pb_code_0.play-button  div  a").on('click', function () {
    posthog.capture("watch_video", {video: 'explainer', placement: 'hero'});
});


// Gravity forms listener
// jQuery(document).ready(function() {
//     jQuery(document).bind('gform_confirmation_loaded', function(event, formId){

//            console.log(event, formId);
//     });
// });

