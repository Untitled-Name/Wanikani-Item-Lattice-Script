// ==UserScript==
// @name         WaniKani Item Lattice
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Recreates the item lattices that were previously removed from Wanikani
// @author       Wantitled
// @match        https://www.wanikani.com/users/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wanikani.com
// @grant        none
// ==/UserScript==

// Defines items globally
let items;

const toggle_section = () => {
    console.log("butter");
}

// Config for wkof fetch
var wkof_config = {
  wk_items: {
    options: {assignments: true},
    filters: {item_type: ["rad", "kan"]}
  }
}

// div templates and definitions
const space = document.createElement("div");
const circle = document.createElement("a");
const container = document.createElement("div");
const rad_img = document.createElement("img");
space.setAttribute("style", `
  height: 3rem;
  width: 3rem;`);
circle.setAttribute("style", `
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  border-radius: 50%;
  text-decoration: none;
  box-shadow: inset 0px -10px 13px -18px rgba(0, 0, 0, 0.50);`)
circle.setAttribute("target", "_blank");
container.setAttribute("style", `
  text-decoration: none;
  font-size: 1.8rem;
  color: white;`);


let lattice = document.createElement("div");
lattice.setAttribute("style", `
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 5vw;
`);

let main_section = document.createElement("section");
main_section.setAttribute("style", `margin: 10px 0; font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;`);
let main_section_title = document.createElement("h2");
main_section_title.setAttribute("style", `padding-bottom: 0.24em; border-bottom: 1px solid #d5d5d5; font-size: 28px;`)
main_section_title.innerText = "Item Lattices";
main_section.appendChild(main_section_title);

let sub_section = document.createElement("div");
let sub_section_title = document.createElement("h3");
sub_section_title.setAttribute("onClick", toggle_section);

// Start
wkof.include('ItemData');
wkof.ready('ItemData').then(get_items).then(initiate);

// Gets item data
async function get_items() {
    items = await wkof.ItemData.get_items(wkof_config);
}

// Filters items to get radicals or kanji
const get_items_of_type = (item_type, items_arr) => {
  let filtered_items = [];
  for (let i = 0; i < items_arr.length; i++){
      if (items_arr[i].object === item_type){
          filtered_items.push(items_arr[i]);
      }
  }
  //let filtered_items = items_arr.filter((item_to_filter) => {item_to_filter.object === item_type});
  return filtered_items
}

// Sorts items by level (although they may already be sorted)
const sort_by_level = (filtered_items) => {
  //let sorted_items = filtered_items.sort((a,b) => {a.data.slug < b.data.slug});
  let sorted_by_level = filtered_items.sort((a,b) => {a.data.level < b.data.level});
  return sorted_by_level
}

// Builds the item lattice for the given item type
const build_lattice = (item_type) => {
  let items_obj = sort_by_level(get_items_of_type(item_type, items));
  let type_lattice = lattice.cloneNode();
  items_obj.map((single_item_obj, index)=>{
    let item_space = space.cloneNode();
    let item_circle = circle.cloneNode();
    let item_container = container.cloneNode();
    item_space.setAttribute("key", index);
    let item_text = single_item_obj.data.characters;
    if (item_text === null){
        console.log(single_item_obj);
        let item_rad_img = rad_img.cloneNode();
        item_rad_img.setAttribute("src", single_item_obj.data.character_images[7].url);
        item_container.appendChild(item_rad_img);
    } else {item_container.innerText = item_text;}
    item_circle.style.backgroundColor = get_item_color(single_item_obj);
    item_circle.setAttribute("href", single_item_obj.data.document_url);
    item_circle.appendChild(item_container);
    item_space.appendChild(item_circle);
    type_lattice.appendChild(item_space);
  })
  return type_lattice
}

// Gets the corresponding color for the SRS level
const get_item_color = (item_obj) => {
  let item_level = item_obj.assignments.srs_stage;
  switch (item_level){
    case 0: return "#AAA";
    case 1: return "#F100A0";
    case 2: return "#F100A0";
    case 3: return "#F100A0";
    case 4: return "#F100A0";
    case 5: return "#9A33B3";
    case 6: return "#9A33B3";
    case 7: return "#4765E0";
    case 8: return "#00A2F3";
    case 9: return "#FBC03D";
    default: return "#474747";
  }
}

// Builds the lattice section
const build_section = (item_type) => {
    let type_lattice = build_lattice(item_type);
    let item_section = sub_section.cloneNode();
    let item_title = sub_section_title.cloneNode();
    item_title.innerText = item_type === "kanji" ? "Kanji Lattice" : "Radical Lattice";
    item_section.appendChild(item_title);
    item_section.appendChild(type_lattice);
    return item_section;
}

function initiate() {
  'use strict';
  let radical_section = build_section("radical");
  let kanji_section = build_section("kanji");
  main_section.appendChild(radical_section);
  main_section.appendChild(kanji_section);
  let body_div = document.querySelector("body").querySelectorAll(".footer-adjustment")[0]
  body_div.insertBefore(main_section, body_div.querySelectorAll("script")[0]);
}
