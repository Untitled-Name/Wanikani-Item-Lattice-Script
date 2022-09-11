// ==UserScript==
// @name         WaniKani Item Lattice
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.wanikani.com/users/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wanikani.com
// @grant        none
// ==/UserScript==

let items;
let items_by_id;

var wkof_config = {
  wk_items: {
    options: {assignments: true},
    filters: {item_type: ["rad", "kan"]}
  }
}

const space = document.createElement("div");
const circle = document.createElement("a");
space.setAttribute("style", `{
  height: 40px;
  width: 40px;
  border-radius: 50%;
  text-align: center;
  font-size: 24px;
  color: white;
  box-shadow: inset 0px -10px 14px -13px rgba(0,0,0,0.5);
`);

const space_style = `{
  height: 40px;
  width: 40px;
  border-radius: 50%;
  text-align: center;
  font-size: 24px;
  color: white;
  box-shadow: inset 0px -10px 14px -13px rgba(0,0,0,0.5);
`;

let lattice = document.createElement("div");
lattice.setAttribute("style", `
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0 5vw;
`);

wkof.include('ItemData');
wkof.ready('ItemData').then(get_items).then(initiate);

// Gets item data
async function get_items() {
    items = await wkof.ItemData.get_items(wkof_config);
    items_by_id = wkof.ItemData.get_index(items, 'subject_id');
}

const get_item_char = (item_obj) => {
    return item_obj.data.characters
}

const getSRSLevel = (wkof_item) => {return wkof_item?.assignments?.srs_stage ?? -1}

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

const sort_by_level = (filtered_items) => {
  let sorted_by_level = filtered_items.sort((a,b) => {a.data.level < b.data.level});
  //let sorted_items = sorted_by_level.sort((a,b) => {a.data.item < b.data.item});
  //console.log(sorted_by_level);
  return sorted_by_level
}

const build_lattice = (item_type) => {
  let items_obj = sort_by_level(get_items_of_type(item_type, items));
  let type_lattice = lattice.cloneNode();
  items_obj.map((single_item_obj, index)=>{
    let item_space = space.cloneNode();
    let item_circle = circle.cloneNode();
    item_space.setAttribute("key", index);
    item_circle.innerText = get_item_char(single_item_obj);
    item_circle.backgroundColor = get_item_color(single_item_obj);
    item_circle.setAttribute("href", get_item_target(single_item_obj));
    item_space.appendChild(item_circle);
    type_lattice.appendChild(item_space);
  })
  console.log(type_lattice);
  return type_lattice
}

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
    default: return "#474747";
  }
}

const get_item_target = (item_obj) => {
    return item_obj.data.document_url;
}

function initiate() {
  'use strict';
  let radical_lattice = build_lattice("radical");
  let kanji_lattice = build_lattice("kanji");
  let body_div = document.querySelector("body").querySelectorAll(".footer-adjustment")[0]
  console.log(body_div)
  body_div.insertBefore(radical_lattice, body_div.querySelectorAll("script")[0]);
  body_div.insertBefore(kanji_lattice, body_div.querySelectorAll("script")[0]);
}
