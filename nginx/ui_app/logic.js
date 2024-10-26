window.addEventListener('load', async function() {
    await loadTeamMembers();
});

async function loadTeamMembers() {
    try {
        const response = await fetch("http://localhost:8000");
        if (response.ok) {
            const responseData = await response.json();
            console.log("Team members loaded:", responseData);
            updateTeamList(responseData.users);
        } else {
            console.error('Failed to load team members:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function sendPostRequest() {
    const firstNameInput = document.getElementById("inputFirstName").value; 
    const lastNameInput = document.getElementById("inputLastName").value;
    const roleSelection = document.getElementById("teamRoles").value;
    const isPrivacyChecked = document.getElementById("checkboxPrivacyPolicy").checked;

    if (!isPrivacyChecked) {
        document.getElementById("alertMessage").style.display = "block";
        return; 
    }

    const newMemberData = {
        name: firstNameInput, 
        surname: lastNameInput, 
        role: roleSelection 
    };   

    try {
        const response = await fetch("http://localhost:8000", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newMemberData)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error('Server Error:', errorMessage);
            alert('Server error: ' + errorMessage);
            return;
        }

        const responseJson = await response.json();
        updateTeamList(responseJson.users);
        clearInputFields();
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('An error occurred. Please try again later.');
    }
}

function clearInputFields() {
    document.getElementById("inputFirstName").value = '';
    document.getElementById("inputLastName").value = '';
    document.getElementById("teamRoles").selectedIndex = 0;
    document.getElementById("checkboxPrivacyPolicy").checked = false; 
    document.getElementById("alertMessage").style.display = "none";
}

function updateTeamList(members) {
    const membersContainer = document.getElementById("teamMembersList");
    membersContainer.innerHTML = '';

    members.forEach((member) => {
        const memberItem = document.createElement("div");
        memberItem.classList.add("team-member-item");

        const memberInfo = document.createElement("div");
        const memberName = document.createElement("span");
        memberName.textContent = `${member.name} ${member.surname}`;
        memberInfo.appendChild(memberName);

        const memberRole = document.createElement("small");
        memberRole.textContent = member.role;
        memberInfo.appendChild(memberRole);

        const removeButton = document.createElement("button");
        removeButton.innerHTML = `<i class="fa-regular fa-trash-can"></i>`;
        removeButton.onclick = function() {
            deleteTeamMember(member.id);
        };
        
        memberItem.appendChild(memberInfo);
        memberItem.appendChild(removeButton);
        membersContainer.appendChild(memberItem);
    });
}

async function deleteTeamMember(memberId) {
    try {
        const response = await fetch(`http://localhost:8000?id=${memberId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const responseData = await response.json();
            updateTeamList(responseData.users);
        } else {
            console.error('Failed to delete member:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}