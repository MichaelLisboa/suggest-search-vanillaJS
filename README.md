# A simple "Suggest-as-you-type" search widget in JavaScript and UIKit 3.

##### While developing Influen$e, I wanted to make the search function a bit more robust for people searching for an influencer's Instagram account by name.

Because discovery is a critical distinguishing feature of Influen$e, I also wanted to build in a simple recommendation function that targeted customers based on the relevance of influencers' content to their core brand values.

In this article, I'll share the code and walk you through how the function works.

<section class="uk-section uk-section-small">
	<div class="content-box uk-container uk-container-small uk-padding-small uk-width-1-2@s">
		<h4 class="uk-text-center">Shortcut this</h4>
		<h5 class="uk-text-center">
            If you know what you're doing, you can get the code from GitHub.
        </h5>
		<div class="uk-text-center">
			<a class="uk-button uk-button-large uk-button-secondary"
                href="https://github.com/MichaelLisboa/suggest-search-vanillaJS">
				Get it on GitHub
			</a>
		</div>
	</div>
</section>

##### Let's begin
We'll start with our search form. It looks like this:

<div class="uk-padding uk-padding-remove-horizontal">
  <form id="SearchMemberForm" class="uk-width-1-3@s">
      <div class="uk-margin-small">
          <div class="uk-inline uk-width-1-1">
              <button id="MemberSubmit" type="submit" class="uk-form-icon uk-form-icon-flip" uk-icon="icon: search"></button>
              <input id="MemberInput" type="search" name="ig_handle" class="member-search-input uk-input uk-form-large" placeholder="e.g., cristiano" autocapitalize="none" autocorrect="off" autocomplete="off">
      </div>
  </form>
</div>

I'm using UIKit 3 for my CSS framework, so this part is easy. Here's the code:

        <form id="SearchMemberForm">
            <div class="uk-margin-small">
                <div class="uk-inline uk-width-1-1">
                    <button id="MemberSubmit" type="submit"
                      class="uk-form-icon uk-form-icon-flip"
                      uk-icon="icon: search"></button>
                    <input id="MemberInput" type="search" name="ig_handle"
                      class="member-search-input uk-input uk-form-large"
                      placeholder="e.g., cristiano" autocapitalize="none"
                      autocorrect="off" autocomplete="off" />
                    <div id="PresetMember" class="uk-width-1-1 uk-margin-remove"
                      uk-dropdown="mode: click; pos: bottom-justify;
                      boundary: .member-search-input"></div>
                </div>
            </div>
        </form>        

##### Getting the data with Fetch
The first thing we need to do is get an Array of objects to populate suggestions, right? So, we'll make a request to an API or cloud function or whatever.

I'm using Fetch because all I need is a JSON object, but if you want more granular control you can use XHR just the same.

```
fetch('://<server>/api/', {
      method: "GET",
      cache: "no-cache",
      credentials: "same-origin",
      headers = {
          "Accept": "application/json",
          "Content-Type": "application/json; charset=utf-8",
          'X-Requested-With': 'XMLHttpRequest'
      };
  })
  .then(res => res.json())
  .then(json => {
      console.log(`JSON response ${json}`)
  })
  .catch(error => console.log(error));
```

__Fetch is pretty straightforward:__
- I send a `GET` request to my API endpoint at `://<server>/api/`.
- `.then(res => res.json())` renders the response as JSON.
- `.then(json => {})` is where we can use that JSON.
- `.catch(error =>...);` catches any errors in our request.

One thing to bear in mind, Fetch doesn't do any error checking, it only returns a fail if something went wrong with the actual request to the server, like a 404 or 500. So, you'll need to write your own error catching code.

If you run that code, you'll get an array of objects. In my case it's an Array of social media influencer objects:


![json-response](//images.ctfassets.net/1nc0h0ipk4bl/2L96k8OKFe4cUVSZBzALCD/962961953a3236c6e8446b8363292726/json-response.png)

##### Coding the UI
Now we need to turn that Array into a nice drop down list. There are two types of lists I'm going to generate.
- One will be for automated recommendations when the user clicks the search field.
- The other will be our suggest-as-you-type list.

To do that, we'll pass our Array to a new function, called `loadLists()`. Let's update our Fetch response to call `loadLists(json)`.

        fetch(endpoint, {
            method: "GET",
            cache: "no-cache",
            credentials: "same-origin",
            headers: headers,
        })
        .then(response => response.json())
        .then(json => loadLists(json))  // <-- Call loadLists() here
        .catch(error => console.log(error));
This passes our Array of member objects to a new function called `loadLists()`:

        let loadLists = (json) => {
            let members = [...json.members];

            let searchSuggest = ['input', function(e) {
                    filterList(event.target.value, members);
                }, false];

            formInput.addEventListener(...searchSuggest);
            presetMembers.innerHTML = userList(members.slice(0, 3));
        }

There's a couple of things going on here.

- First, we're using a spread operator `[...json.members]` to get to the objects in our array.
- Next, we're creating an Array called `searchSuggest`, and within calling the `filterList()` function.
- Then, we add an event listener to the input field in our HTML form.
- And finally, we're loading the top three recommended influencers into the `presetMembers` drop down menu (I'll get to that soon).

The reason we created the `searchSuggest` Array is because we want to pass the event and the function call to our event listener. It's just a cleaner way of separating our functions.

Okay, let's have a look at the `filterList();` function.

        let filterList = (key, members) => {
            let listEl = document.getElementById('MemberList');
            listEl.innerHTML = '';  // <-- Clear the field to avoid repeated entries.

            for (let i = 0; i < members.length; i++) {
                if ((members[i].ig_handle.toLowerCase())
                    .indexOf(key.toLowerCase()) > -1) {
                    let node = () => (
                        `<li class="member-link">
                            ${members[i].ig_handle}
                        </li>`
                    );
                    if (listEl.childNodes.length < 5) {
                        listEl.insertAdjacentHTML('beforeend', node());
                    }
                }
                if (key.length < 2) {
                    listEl.innerHTML = '';
                    presetMembers.innerHTML = userList(members.slice(0, 3));
                }
            }
        };

Wow, that's the biggest chunk of code so far. Let's walk through it.

First, we're looking at a couple of arguments `key` and `members`. So the argument `members` is obviously our Array of members we got from our Fetch API call.

But what is `key`?

Remember when we created that Array called `searchSuggest`? Reminder, the event we added is

```
searchSuggest = ['input', function(e) {...
```

We're adding an event listener for `input`, basically saying for every character the user types into our form field, fire the `input` event. Get it? The `input` event is a keystroke, which is our `key` argument.

In other words, every time a user types a character into our search field, fire the `filterList()` function.

Next, we're getting the `MemberList` element from our HTML. This is where we'll generate our member list.

Let's take a look at our `for loop`.

In this line we're converting all text to lowercase so our searches will be case insensitive:
```
if ((members[i].ig_handle.toLowerCase()).indexOf(key.toLowerCase()) > -1)
```
Then for each character entered, we iterate through our members list and create a new list item node:
```
let node = () => (
    `<li class="member-link">
        ${members[i].ig_handle}
    </li>`
);
```
`${members[i].ig_handle}` is how we're identifying our members. In my case I'm looking them up by the Instagram username `ig_handle`.

Then we get up to five members and add them to our list using `insertAdjacentHTML`:
```
if (listEl.childNodes.length < 5) {
    listEl.insertAdjacentHTML('beforeend', node());
}
```

And finally, if the user enters less than two characters -- or backspaces to less than two characters -- reload our `presetMembers`, hiding our suggestions:
```
if (key.length < 2) {
    listEl.innerHTML = '';
    presetMembers.innerHTML = userList(members.slice(0, 3));
}
```

##### Stitching it all together

Let get our elements using `getElementById`.
```
let formInput = document.getElementById('MemberInput')  // <-- form <input> field
let presetMembers = document.getElementById('PresetMember');  // <-- div for our list
```

Then we're going to use ES6 template literals to generate our `<ul>` markup that we're inserting into the `presetmember` div.

```
let userListItem = (item) => (
    `<li class="uk-width-1-1">
        <img class="uk-border-circle uk-width-1-4 uk-float-left" src="${item.profile_pic}" data-uk-image />
        <p class="uk-width-3-4 uk-text-lead uk-text-truncate uk-padding-small uk-padding-remove-vertical">${item.ig_handle}</p>
    </li>`
);

let userList = (list) => (
    `<ul id="MemberList" class="uk-list uk-list-divider uk-padding-remove-vertical">
        ${list.map(userListItem).join('')}
    </ul>`
);
```

Save the file and (hopefully) it should all work beautifully!
